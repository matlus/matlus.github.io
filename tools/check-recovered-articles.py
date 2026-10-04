"""Compare recovered publication copies to their immutable source captures."""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
from pathlib import Path
from typing import Any

import yaml
from bs4 import BeautifulSoup, Tag
from markdown_it import MarkdownIt

ROOT: Path = Path(__file__).resolve().parents[1]
ARCHIVE: Path = ROOT / "docs/source-material/matlus-wayback"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def normalized_prose(soup: BeautifulSoup) -> str:
    for element in soup.select("pre, img, [data-reconstruction], [data-source-license]"):
        element.decompose()
    return re.sub(r"\s+", "", soup.get_text())


def main() -> int:
    parser: argparse.ArgumentParser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ready", action="store_true", help="Require all metadata, assets, and publication flags.")
    args: argparse.Namespace = parser.parse_args()
    register: dict[str, Any] = read_json(ROOT / "docs/recovered-articles/execution.json")
    renderer: MarkdownIt = MarkdownIt("commonmark", {"html": True}).enable("table")
    failures: list[str] = []
    total_code: int = 0
    image_code: dict[str, Any] = read_json(ROOT / "docs/recovered-articles/source-image-code.json")
    for item in read_json(ARCHIVE / "checksums.json"):
        if hashlib.sha256((ARCHIVE / item["path"]).read_bytes()).hexdigest() != item["sha256"]:
            failures.append(f"Archive modified: {item['path']}")
    for article in register["articles"]:
        slug: str = article["slug"]
        source: dict[str, Any] = read_json(ARCHIVE / article["sourceMetadata"])
        text: str = (ROOT / "src/content/writing" / f"{slug}.md").read_text(encoding="utf-8")
        _, header, body = text.split("---", 2)
        metadata: dict[str, Any] = yaml.safe_load(header)
        for key, transcription in image_code.items():
            if not key.startswith(slug + "/"):
                continue
            block: Tag | None = BeautifulSoup(body, "html.parser").find("pre", attrs={"data-source-image-code": key})
            if block is None or block.get_text() != transcription["code"]:
                failures.append(f"{key}: code transcribed from source image changed")
        if str(metadata["datePublished"]) != article["datePublished"] or metadata["title"] != article["title"]:
            failures.append(f"{slug}: title or original date changed")
        if str(metadata.get("dateModified")) != article["datePublished"]:
            failures.append(f"{slug}: modification date must equal the original publication date")
        if metadata.get("youtube") or metadata.get("repositories"):
            failures.append(f"{slug}: unexpected video or repository association")
        if "Licensing:MIT License" in source["header"]:
            license_notice: Tag | None = BeautifulSoup(body, "html.parser").select_one("[data-source-license]")
            license_urls: set[str] = {link["url"] for link in source["links"] if link["text"] == "MIT License"}
            if license_notice is None or license_notice.get_text(" ", strip=True) != "Licensing: MIT License":
                failures.append(f"{slug}: original license notice missing")
            elif license_notice.a is None or license_notice.a.get("href") not in license_urls:
                failures.append(f"{slug}: original license link changed")
        code: list[str] = [token.content for token in renderer.parse(body) if token.type == "fence"]
        total_code += len(code)
        if len(code) != len(source["code"]):
            failures.append(f"{slug}: code count {len(code)} != {len(source['code'])}")
        for index, (expected, actual) in enumerate(zip(source["code"], code)):
            # A fenced block requires its closing fence on a new line.
            if actual != expected + ("" if expected.endswith("\n") else "\n"):
                failures.append(f"{slug}: code block {index + 1} changed")
        original: str = normalized_prose(BeautifulSoup(source["html"], "html.parser"))
        rendered: str = normalized_prose(BeautifulSoup(renderer.render(body), "html.parser"))
        if original != rendered:
            differences: list[str] = []
            matcher: difflib.SequenceMatcher[str] = difflib.SequenceMatcher(None, original, rendered, autojunk=False)
            for operation, start, end, new_start, new_end in matcher.get_opcodes():
                if operation != "equal":
                    differences.append(f"{operation}: {original[start:end][:80]!r} -> {rendered[new_start:new_end][:80]!r}")
            failures.append(f"{slug}: prose differs: {'; '.join(differences[:5])}")
        if args.ready:
            if metadata.get("draft") or not metadata.get("tags") or not 140 <= len(metadata["description"]) <= 200:
                failures.append(f"{slug}: publication metadata incomplete")
            for asset in [f"src/assets/heroes/{slug}.webp", f"src/assets/heroes/{slug}.prompt.md", *["public" + image["asset"] for image in article["images"]]]:
                if not (ROOT / asset).is_file():
                    failures.append(f"{slug}: missing asset {asset}")
    for failure in failures:
        print(failure)
    print(f"Checked {len(register['articles'])} articles, {total_code} code blocks, and 215 archive checksums: {len(failures)} failures.")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
