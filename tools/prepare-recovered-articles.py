"""Prepare faithful publication copies and an execution register from the archive.

Requires beautifulsoup4, markdownify, and PyYAML in the editorial environment.
The archive is read-only. Run again only before hand-editing publication copies.
"""

from __future__ import annotations

import json
import hashlib
import argparse
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlsplit

import yaml
from bs4 import BeautifulSoup, Tag, NavigableString
from markdownify import markdownify

ROOT: Path = Path(__file__).resolve().parents[1]
ARCHIVE: Path = ROOT / "docs/source-material/matlus-wayback"
REGISTER: Path = ROOT / "docs/recovered-articles/execution.json"


@dataclass(frozen=True)
class ArticleSource:
    index: int
    title: str
    slug: str
    date: str
    metadata_path: str
    html_path: str
    original_url: str


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def original_url(url: str) -> str:
    return re.sub(r"^https?://web\.archive\.org/web/[^/]+/", "", url)


def url_key(url: str) -> str:
    parsed = urlsplit(original_url(url))
    return unquote(parsed.path).rstrip("/").lower()


def sources() -> tuple[ArticleSource, ...]:
    manifest: dict[str, Any] = read_json(ARCHIVE / "manifest.json")
    result: list[ArticleSource] = []
    for index, entry in enumerate(manifest["articles"]):
        match: re.Match[str] | None = re.search(
            r"on (\d+)(?:st|nd|rd|th) ([A-Za-z]+), (\d{4})", entry["originalHeader"]
        )
        if match is None:
            raise ValueError(f"Missing original date: {entry['title']}")
        date: str = datetime.strptime(" ".join(match.groups()), "%d %B %Y").date().isoformat()
        slug: str = url_key(entry["originalUrl"]).strip("/")
        if not re.fullmatch(r"[a-z0-9-]+", slug):
            raise ValueError(f"Unexpected original URL slug: {slug}")
        result.append(ArticleSource(index, entry["title"], slug, date,
                                    entry["metadata"], entry["html"], entry["originalUrl"]))
    return tuple(result)


def language(code: str, panel: Tag | None) -> str:
    hint: str = str(panel.get("class", "")) if panel else ""
    if "javascript" in hint or re.search(r"\b(function|document\.|XMLHttpRequest|var xhr)\b", code):
        return "javascript"
    if "html.png" in hint or code.lstrip().startswith(("<!", "<html", "<form")):
        return "html"
    if code.lstrip().startswith(("<?xml", "<configuration", "<system.", "<bindings")):
        return "xml"
    if code.lstrip().startswith(('"%ProgramFiles', "net ", "sc ", "@echo")):
        return "bat"
    if code.lstrip().startswith(("SELECT ", "CREATE ", "DBCC ")):
        return "sql"
    return "csharp" if "csharp" in hint or re.search(r"\b(public|private|using|class|namespace)\b", code) else "text"


def prepare(source: ArticleSource, mapping: dict[str, str], refresh: bool) -> dict[str, Any]:
    capture: dict[str, Any] = read_json(ARCHIVE / source.metadata_path)
    reading: BeautifulSoup = BeautifulSoup((ARCHIVE / source.html_path).read_text(encoding="utf-8-sig"), "html.parser")
    article: Tag | None = reading.select_one(".articleText")
    if article is None:
        raise ValueError(f"Missing article body: {source.title}")
    tokens: dict[str, str] = {}
    code_blocks: list[str] = capture["code"]
    pres: list[Tag] = list(article.find_all("pre"))
    if len(pres) != len(code_blocks):
        raise ValueError(f"Code count differs: {source.title}")
    for index, (pre, code) in enumerate(zip(pres, code_blocks, strict=True)):
        token: str = f"RECOVEREDCODEBLOCK{index:04d}TOKEN"
        fence: str = "`" * max(3, 1 + max((len(m.group()) for m in re.finditer(r"`+", code)), default=0))
        tokens[token] = f"\n\n{fence}{language(code, pre.parent if isinstance(pre.parent, Tag) else None)}\n{code}" + ("" if code.endswith("\n") else "\n") + f"{fence}\n\n"
        replacement: Tag = reading.new_tag("p")
        replacement.string = token
        pre.replace_with(replacement)

    images: list[dict[str, Any]] = []
    for index, img in enumerate(article.find_all("img")):
        if isinstance(img.parent, Tag) and img.parent.name == "a" and not img.parent.get_text(strip=True):
            img.parent.unwrap()
        src: str = str(img.get("src", ""))
        archived_path: str | None = str((ARCHIVE / "html" / src).resolve().relative_to(ROOT)).replace("\\", "/") if src.startswith("../images/") else None
        asset: str = f"/images/writing/{source.slug}/figure-{index + 1:02d}.webp"
        alt: str = str(img.get("alt", ""))
        token = f"RECOVEREDIMAGE{index:04d}TOKEN"
        tokens[token] = f"\n\n![{alt.replace('[', '').replace(']', '')}]({asset})\n\n"
        img.replace_with(token)
        images.append({"index": index, "originalAlt": alt, "sourcePath": archived_path,
                       "sourceUrl": capture["images"][index]["url"], "asset": asset,
                       "status": "pending", "kind": "unclassified"})

    links: list[dict[str, str]] = []
    for anchor in article.find_all("a"):
        named: str = str(anchor.get("name", anchor.get("id", "")))
        if named:
            token = f"RECOVEREDANCHOR{len(tokens):04d}TOKEN"
            tokens[token] = f'\n\n<a id="{named}"></a>\n\n'
            anchor.insert_before(token)
        href: str = str(anchor.get("href", ""))
        if not href:
            continue
        parsed = urlsplit(original_url(href))
        if parsed.hostname in {"matlus.com", "www.matlus.com"} and url_key(href) in mapping:
            target: str = mapping[url_key(href)] + (f"#{parsed.fragment}" if parsed.fragment else "")
            anchor["href"] = target
            links.append({"from": href, "to": target})
        elif href.startswith(("http:", "https:")):
            links.append({"from": href, "to": href})
    # Modern presentation retains all visible text while discarding old layout attributes.
    for element in article.find_all(["span", "font"]):
        element.unwrap()
    # Preserve inline code, including linked identifiers, as escaped HTML.
    for index, inline in enumerate(article.find_all("code")):
        if not inline.get_text(strip=True):
            inline.unwrap()
            continue
        inline.attrs = {}
        token = f"RECOVEREDINLINE{index:04d}TOKEN"
        tokens[token] = str(inline).replace("\\", "&#92;")
        inline.replace_with(token)
    # HTML tables preserve multiline cells and literal vertical bars faithfully.
    for index, table in enumerate(article.find_all("table")):
        for element in [table, *table.find_all()]:
            element.attrs = {key: value for key, value in element.attrs.items() if key in {"href", "id", "colspan", "rowspan"}}
        token = f"RECOVEREDTABLE{index:04d}TOKEN"
        tokens[token] = "\n\n" + str(table) + "\n\n"
        table.replace_with(token)
    # Some originals number ordinary paragraphs explicitly. Preserve those digits.
    for paragraph in article.find_all("p"):
        if paragraph.contents and isinstance(paragraph.contents[0], NavigableString):
            start: str = str(paragraph.contents[0])
            if re.match(r"^\s*\d+\.\s", start):
                paragraph.contents[0].replace_with(re.sub(r"^(\s*\d+)\.", r"\1RECOVEREDDOT", start))
    tokens["RECOVEREDDOT"] = r"\."
    converted: str = markdownify(str(article), heading_style="ATX", bullets="-", escape_underscores=True, autolinks=False)
    # Literal generic type names in prose must not become HTML elements.
    converted = converted.replace("<", "&lt;")
    converted = re.sub(r"\n{4,}", "\n\n\n", converted).strip() + "\n"
    for token, value in reversed(tokens.items()):
        converted = converted.replace(token, value)
    # Encode punctuation losslessly; the site's text feed decodes these entities.
    # Never apply this to fenced code, whose exact bytes are independently checked.
    sections: list[str] = re.split(r"(^`{3,}[^\n]*\n[\s\S]*?^`{3,}\s*$)", converted, flags=re.M)
    for index in range(0, len(sections), 2):
        sections[index] = sections[index].replace("—", "&#8212;").replace("…", "&#8230;")
    converted = "".join(sections)
    output: Path = ROOT / f"src/content/writing/{source.slug}.md"
    if output.exists() and not refresh:
        raise FileExistsError(f"Refusing to overwrite publication copy: {output}")
    frontmatter: dict[str, Any] = {"title": source.title, "description": source.title,
        "datePublished": source.date, "dateModified": source.date, "tags": [],
        "hero": source.slug, "draft": True}
    output.write_text("---\n" + yaml.safe_dump(frontmatter, allow_unicode=True, sort_keys=False) + "---\n\n" + converted, encoding="utf-8")
    return {"index": source.index, "title": source.title, "slug": source.slug,
            "datePublished": source.date, "sourceMetadata": source.metadata_path,
            "sourceHtml": source.html_path, "originalUrl": source.original_url,
            "url": mapping[url_key(source.original_url)], "codeBlocks": len(code_blocks),
            "codeHashes": [hashlib.sha256(code.encode()).hexdigest() for code in code_blocks],
            "images": images, "links": links, "metadataStatus": "pending",
            "heroStatus": "pending", "fidelityStatus": "pending", "publicationStatus": "draft"}


def main() -> None:
    parser: argparse.ArgumentParser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="Replace generated drafts and register before editorial work.")
    options: argparse.Namespace = parser.parse_args()
    if REGISTER.exists():
        existing: dict[str, Any] = json.loads(REGISTER.read_text(encoding="utf-8-sig"))
        if any(item.get("metadataStatus") != "pending" for item in existing["articles"]):
            raise RuntimeError("Reviewed publication copies cannot be regenerated; edit them directly.")
    articles: tuple[ArticleSource, ...] = sources()
    mapping: dict[str, str] = {url_key(a.original_url): f"/writing/{a.slug}/" for a in articles}
    if REGISTER.exists() and not options.refresh:
        raise FileExistsError("Execution register already exists; inspect before regenerating.")
    result: list[dict[str, Any]] = [prepare(article, mapping, options.refresh) for article in articles]
    REGISTER.parent.mkdir(parents=True, exist_ok=True)
    REGISTER.write_text(json.dumps({"articles": result}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REGISTER.parent / "redirects.json").write_text(json.dumps(
        {url_key(a.original_url) + "/": mapping[url_key(a.original_url)] for a in articles}, indent=2) + "\n", encoding="utf-8")
    print(f"Prepared {len(result)} draft publication copies and the execution register.")


if __name__ == "__main__":
    main()
