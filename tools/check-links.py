"""Fail when generated pages or retrieval indexes point at missing local files."""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree


class LocalLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        source_attribute: str | None = {
            "a": "href",
            "link": "href",
            "img": "src",
            "audio": "src",
            "source": "src",
            "script": "src",
        }.get(tag)
        if source_attribute is None:
            return
        url: str | None = dict(attrs).get(source_attribute)
        if url:
            self.urls.append(url)


def site_origin(directory: Path) -> str:
    sitemap: Path = directory / "sitemap-index.xml"
    document: ElementTree.Element = ElementTree.parse(sitemap).getroot()
    location: ElementTree.Element | None = document.find(".//{*}loc")
    if location is None or location.text is None:
        raise ValueError(f"No site URL found in {sitemap}")
    parsed = urlsplit(location.text)
    return f"{parsed.scheme}://{parsed.netloc}"


def local_target(url: str, source: Path, directory: Path, origin: str) -> Path | None:
    parsed = urlsplit(url)
    if not parsed.path or parsed.scheme in {"mailto", "tel", "data", "javascript"}:
        return None
    if parsed.scheme or parsed.netloc:
        if f"{parsed.scheme}://{parsed.netloc}" != origin:
            return None
    path: str = unquote(parsed.path)
    target: Path = (directory / path.lstrip("/")) if path.startswith("/") else (source.parent / path)
    resolved: Path = target.resolve()
    if not resolved.is_relative_to(directory):
        raise ValueError(f"Local URL escapes the build directory: {url}")
    return resolved


def exists_as_page(target: Path) -> bool:
    return target.is_file() or (target / "index.html").is_file()


def check_links(directory: Path) -> dict[str, set[str]]:
    origin: str = site_origin(directory)
    missing: dict[str, set[str]] = defaultdict(set)

    for page in directory.rglob("*.html"):
        parser = LocalLinks()
        parser.feed(page.read_text(encoding="utf-8"))
        for url in parser.urls:
            target: Path | None = local_target(url, page, directory, origin)
            if target is not None and not exists_as_page(target):
                missing[urlsplit(url).path].add(page.relative_to(directory).as_posix())

    for name in ("llms.txt", "llms-full.txt"):
        index: Path = directory / name
        for url in re.findall(r"https?://[^\s)]+", index.read_text(encoding="utf-8")):
            target = local_target(url.rstrip(".,"), index, directory, origin)
            if target is not None and not exists_as_page(target):
                missing[urlsplit(url).path].add(name)

    return missing


def main() -> int:
    directory: Path = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
    missing: dict[str, set[str]] = check_links(directory)
    for path, sources in sorted(missing.items()):
        print(f"Missing {path} (from {', '.join(sorted(sources))})")
    if missing:
        print(f"{len(missing)} missing local target(s)")
        return 1
    print("All generated local links resolve.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
