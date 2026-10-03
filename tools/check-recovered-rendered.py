"""Verify built or live recovered articles, Markdown twins, images and redirects."""

from __future__ import annotations

import argparse
import collections
import concurrent.futures
import importlib.util
import json
import re
import urllib.request
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urljoin, urlsplit

import yaml
from bs4 import BeautifulSoup, Tag

ROOT: Path = Path(__file__).resolve().parents[1]
SPEC: Any = importlib.util.spec_from_file_location("fidelity", ROOT / "tools/check-recovered-articles.py")
FIDELITY: Any = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FIDELITY)


def typography(text: str) -> str:
    """Allow Astro's existing smart quotes and ellipsis typography in HTML only."""
    return text.translate(str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"', "…": "..."}))


def read_resource(path: str, base: str | None) -> bytes:
    if base is not None:
        request: urllib.request.Request = urllib.request.Request(urljoin(base, path), headers={"User-Agent": "MatlusPublicationVerification/1.0"})
        with urllib.request.urlopen(request, timeout=45) as response:
            return response.read()
    file: Path = ROOT / "dist" / unquote(urlsplit(path).path).lstrip("/")
    if file.is_dir():
        file /= "index.html"
    return file.read_bytes()


def check_article(article: dict[str, Any], base: str | None) -> tuple[list[str], set[str]]:
    slug: str = article["slug"]
    failures: list[str] = []
    assets: set[str] = set()
    source: dict[str, Any] = FIDELITY.read_json(FIDELITY.ARCHIVE / article["sourceMetadata"])
    text: str = (ROOT / "src/content/writing" / f"{slug}.md").read_text(encoding="utf-8")
    _, header, body = text.split("---", 2)
    metadata: dict[str, Any] = yaml.safe_load(header)
    soup: BeautifulSoup = BeautifulSoup(read_resource(article["url"], base).decode("utf-8"), "html.parser")
    content: Tag | None = soup.select_one(".article-body > article.prose")
    if content is None:
        return [f"{slug}: article body missing"], assets
    identifiers: collections.Counter[str] = collections.Counter(str(node["id"]) for node in content.select("[id]"))
    if any(count > 1 for count in identifiers.values()):
        failures.append(f"{slug}: duplicate article anchor IDs")
    code: list[str] = [block.get_text() for block in content.select("pre:not([data-source-image-code])")]
    if len(code) != len(source["code"]) or any(actual.rstrip("\n") != expected.rstrip("\n") for actual, expected in zip(code, source["code"])):
        failures.append(f"{slug}: rendered code differs")
    for key, transcription in FIDELITY.read_json(ROOT / "docs/recovered-articles/source-image-code.json").items():
        if key.startswith(slug + "/"):
            block: Tag | None = content.find("pre", attrs={"data-source-image-code": key})
            if block is None or block.get_text() != transcription["code"]:
                failures.append(f"{slug}: rendered image transcription differs")
    canonical: Tag | None = soup.select_one('link[rel="canonical"]')
    if canonical is None or canonical.get("href") != "https://matlus.com" + article["url"]:
        failures.append(f"{slug}: canonical differs")
    ld: list[dict[str, Any]] = [json.loads(node.get_text()) for node in soup.select('script[type="application/ld+json"]')]
    if not any(item.get("headline") == article["title"] and item.get("datePublished", "").startswith(article["datePublished"]) for item in ld):
        failures.append(f"{slug}: structured title/date differs")
    topics: set[str] = {str(a.get("href")) for a in soup.select(".article-head__tags a")}
    topic_overrides: dict[str, str] = {"factory-pattern": "/writing/factory-pattern/", "factory-method": "/writing/factory-method-pattern/"}
    if topics != {topic_overrides.get(tag, f"/tags/{tag}/") for tag in metadata["tags"]}:
        failures.append(f"{slug}: rendered tags differ: {topics}")
    hero: Tag | None = soup.select_one("img.article-head__hero")
    if hero is None:
        failures.append(f"{slug}: hero missing")
    for image in soup.select(".article-head__hero, .article-body img"):
        assets.add(str(image["src"]))
        assets.update(part.strip().split()[0] for part in str(image.get("srcset", "")).split(",") if part.strip())
    actual_images: list[str] = [str(image.get("src")) for image in content.select("img")]
    if actual_images != [image["asset"] for image in article["images"]]:
        failures.append(f"{slug}: inline image coverage/order differs")
    for link in content.select("a[href]"):
        target: str = urljoin("https://matlus.com" + article["url"], str(link["href"]))
        parsed = urlsplit(target)
        if parsed.hostname != "matlus.com":
            continue
        try:
            destination: bytes = read_resource(parsed.path, None)
            if parsed.fragment and not parsed.path.endswith(".webp"):
                target_soup: BeautifulSoup = BeautifulSoup(destination, "html.parser")
                if target_soup.find(id=unquote(parsed.fragment)) is None and target_soup.find(attrs={"name": unquote(parsed.fragment)}) is None:
                    failures.append(f"{slug}: missing link fragment {target}")
        except OSError:
            failures.append(f"{slug}: missing internal link {target}")
    actual_prose: str = FIDELITY.normalized_prose(BeautifulSoup(str(content), "html.parser"))
    if typography(actual_prose) != typography(FIDELITY.normalized_prose(BeautifulSoup(source["html"], "html.parser"))):
        failures.append(f"{slug}: rendered prose differs")
    twin: str = read_resource(f"/writing/{slug}.md", base).decode("utf-8").replace("\r\n", "\n")
    expected_body: str = re.sub(r"<!-- audit-allow: [^\n]+ -->\n", "", body).replace("&#8212;", "—").replace("&#8230;", "…")
    if twin.split("\n---\n", 1)[-1].strip() != expected_body.strip():
        failures.append(f"{slug}: Markdown body differs")
    if f"Published: {article['datePublished']}\n" not in twin or f"Tags: {', '.join(metadata['tags'])}\n" not in twin:
        failures.append(f"{slug}: Markdown metadata differs")
    return failures, assets


def check_topic(slug: str, base: str | None) -> tuple[list[str], set[str]]:
    soup: BeautifulSoup = BeautifulSoup(read_resource(f"/tags/{slug}/", base).decode("utf-8"), "html.parser")
    failures: list[str] = []
    images: list[Tag] = soup.select("main img")
    if not any(f"tag-{slug}." in str(image.get("src")) for image in images):
        failures.append(f"{slug}: topic hero missing")
    if not soup.select('main a[href^="/writing/"]'):
        failures.append(f"{slug}: topic has no article links")
    assets: set[str] = {str(image["src"]) for image in images}
    return failures, assets


def main() -> int:
    parser: argparse.ArgumentParser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--live", action="store_true")
    args: argparse.Namespace = parser.parse_args()
    base: str | None = "https://matlus.com" if args.live else None
    articles: list[dict[str, Any]] = FIDELITY.read_json(ROOT / "docs/recovered-articles/execution.json")["articles"]
    failures: list[str] = []
    assets: set[str] = set()
    topics: list[dict[str, Any]] = FIDELITY.read_json(ROOT / "docs/recovered-articles/new-tags.json")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        futures: dict[concurrent.futures.Future[tuple[list[str], set[str]]], str] = {pool.submit(check_article, article, base): article["slug"] for article in articles}
        futures.update({pool.submit(check_topic, topic["slug"], base): topic["slug"] for topic in topics})
        for future in concurrent.futures.as_completed(futures):
            try:
                problems, article_assets = future.result()
                failures.extend(problems)
                assets.update(article_assets)
            except Exception as error:
                failures.append(f"{futures[future]}: {error}")
        asset_futures: dict[concurrent.futures.Future[bytes], str] = {pool.submit(read_resource, asset, base): asset for asset in assets}
        for asset_future in concurrent.futures.as_completed(asset_futures):
            try:
                if not asset_future.result():
                    failures.append(f"Empty image: {asset_futures[asset_future]}")
            except Exception as error:
                failures.append(f"{asset_futures[asset_future]}: {error}")
    redirects: dict[str, str] = FIDELITY.read_json(ROOT / "docs/recovered-articles/redirects.json")
    for old, new in redirects.items():
        try:
            redirect: BeautifulSoup = BeautifulSoup(read_resource(old, base), "html.parser")
            refresh: Tag | None = redirect.select_one('meta[http-equiv="refresh"]')
            if refresh is None or new not in str(refresh.get("content")):
                failures.append(f"{old}: redirect differs")
        except Exception as error:
            failures.append(f"{old}: {error}")
    for failure in sorted(failures):
        print(failure)
    print(f"Checked {'live' if args.live else 'built'} HTML/Markdown for {len(articles)} articles, {len(topics)} topics, {len(assets)} image resources and {len(redirects)} redirects: {len(failures)} failures.")
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
