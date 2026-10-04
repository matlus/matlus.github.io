"""Check generated local destinations and enforce external links opening new tabs."""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import SplitResult, unquote, urljoin, urlsplit
from xml.etree import ElementTree


@dataclass(frozen=True)
class Anchor:
    href: str
    target: str
    relations: frozenset[str]


class LocalLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.urls: list[str] = []
        self.anchors: list[Anchor] = []

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
            if tag == 'a':
                attributes: dict[str, str | None] = dict(attrs)
                self.anchors.append(Anchor(
                    href=url,
                    target=attributes.get('target') or '',
                    relations=frozenset((attributes.get('rel') or '').lower().split()),
                ))


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
        parser: LocalLinks = LocalLinks()
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
    external_failures: list[str] = check_external_links(directory)
    for failure in external_failures:
        print(failure)
    if missing or external_failures:
        print(f"{len(missing)} missing local target(s)")
        print(f"{len(external_failures)} external link policy failure(s)")
        return 1
    print("All generated local links resolve.")
    print("All external HTTP(S) links open a new tab with noopener and noreferrer.")
    return 0


def check_external_links(directory: Path) -> list[str]:
    origin: str = site_origin(directory)
    failures: list[str] = []
    for page in directory.rglob('*.html'):
        parser: LocalLinks = LocalLinks()
        parser.feed(page.read_text(encoding='utf-8'))
        for anchor in parser.anchors:
            destination: SplitResult = urlsplit(urljoin(origin, anchor.href))
            if destination.scheme not in {'http', 'https'}:
                continue
            if f'{destination.scheme}://{destination.netloc}' == origin:
                continue
            if anchor.target != '_blank' or not {'noopener', 'noreferrer'} <= anchor.relations or 'opener' in anchor.relations:
                failures.append(f'External link must open a new tab: {page.relative_to(directory)} -> {anchor.href}')
    return failures


if __name__ == "__main__":
    raise SystemExit(main())
