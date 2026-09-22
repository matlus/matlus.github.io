"""Keep the tag vocabulary free of near-duplicates.

The content schema already rejects a tag that is not declared in
src/data/tags.ts. What it cannot catch is a declared tag that duplicates
another: `test` beside `testing`, `llm-system` beside `llm-systems`. This
script catches the lexical cases. Synonyms with no shared spelling, such as
`error-handling` and `exceptions`, are a judgment the tagging procedure makes
before a tag is ever added.

Usage:
    python tools/check-tags.py                  # audit the vocabulary, exit 1 on a clash
    python tools/check-tags.py domain-facade    # show the closest existing tags to a candidate
"""

from __future__ import annotations

import re
import sys
from difflib import SequenceMatcher
from pathlib import Path

TAGS_FILE = Path(__file__).resolve().parent.parent / "src" / "data" / "tags.ts"
CONTENT_DIR = Path(__file__).resolve().parent.parent / "src" / "content"

SIMILARITY_THRESHOLD = 0.85

SUFFIXES = ("ings", "ing", "ies", "es", "s", "ed")


def read_slugs() -> list[str]:
    text = TAGS_FILE.read_text(encoding="utf-8")
    return re.findall(r"slug:\s*'([a-z0-9-]+)'", text)


def stem_word(word: str) -> str:
    for suffix in SUFFIXES:
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[: -len(suffix)]
    return word


def stem_slug(slug: str) -> str:
    return "-".join(stem_word(word) for word in slug.split("-"))


def similarity(first: str, second: str) -> float:
    return SequenceMatcher(None, stem_slug(first), stem_slug(second)).ratio()


def tag_usage() -> dict[str, int]:
    usage: dict[str, int] = {}
    for path in CONTENT_DIR.rglob("*.md*"):
        frontmatter = path.read_text(encoding="utf-8").split("---", 2)[1]
        block = re.search(r"^tags:\n((?:\s+- .+\n)+)", frontmatter, re.MULTILINE)
        if block is None:
            continue
        for tag in re.findall(r"- ([a-z0-9-]+)", block.group(1)):
            usage[tag] = usage.get(tag, 0) + 1
    return usage


def find_clashes(slugs: list[str]) -> list[tuple[str, str, float]]:
    clashes = []
    for index, first in enumerate(slugs):
        for second in slugs[index + 1 :]:
            score = similarity(first, second)
            if stem_slug(first) == stem_slug(second) or score >= SIMILARITY_THRESHOLD:
                clashes.append((first, second, score))
    return clashes


def show_neighbours(candidate: str, slugs: list[str]) -> None:
    usage = tag_usage()
    candidate_words = set(stem_slug(candidate).split("-"))
    ranked = sorted(
        slugs,
        key=lambda slug: (
            len(candidate_words & set(stem_slug(slug).split("-"))),
            similarity(candidate, slug),
        ),
        reverse=True,
    )
    exact = [slug for slug in slugs if stem_slug(slug) == stem_slug(candidate)]
    if exact:
        print(f"'{candidate}' duplicates existing tag '{exact[0]}'. Use that.")
        return
    print(f"Closest existing tags to '{candidate}':")
    for slug in ranked[:5]:
        shared = len(candidate_words & set(stem_slug(slug).split("-")))
        print(
            f"  {slug:<28} similarity {similarity(candidate, slug):.2f}"
            f"  shared words {shared}  used by {usage.get(slug, 0)} page(s)"
        )


def main() -> int:
    slugs = read_slugs()
    if len(sys.argv) > 1:
        show_neighbours(sys.argv[1], slugs)
        return 0

    clashes = find_clashes(slugs)
    for first, second, score in clashes:
        print(f"Near-duplicate tags: '{first}' and '{second}' (similarity {score:.2f})")
    if clashes:
        print(f"\n{len(clashes)} near-duplicate pair(s). Merge them in src/data/tags.ts.")
        return 1
    print(f"{len(slugs)} tags, no near-duplicates.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
