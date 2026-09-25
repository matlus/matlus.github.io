#!/usr/bin/env python3
"""Convert PWI corpus chapters into site content.

The campaign runs across many sessions, so the manifest is both the ledger and
the input. `tools/chapter-manifest.json` records chapters considered for this
site, their status, and, for anything skipped, why.

Status values:

    pending    teaching prose, not yet given a description and tags
    ready      metadata filled in, waiting to be converted
    converted  written into src/content/chapters
    skipped    deliberately not published, with a reason recorded

Only `ready` rows are converted, and they become `converted` afterwards, so
rerunning is safe and resumable.

The prose itself is never rewritten. Chapters answer to corpus conventions
rather than to the site's writing style, so exactly two mechanical edits apply:
the chapter H1 comes off because the layout renders the title, and relative
corpus links are rewritten or flattened because they do not resolve off-repo.

    python tools/convert-chapters.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

CORPUS = Path(r"D:\Python\PWI Code Review\source\chapters")
MANIFEST = Path("tools/chapter-manifest.json")
OUT_DIR = Path("src/content/chapters")

# Every PWI chapter carries the date the body of work began. Git history records
# only when the markdown entered the repository, which is years later.
PWI_ORIGIN = "2017-09-20"

def last_modified(file_name: str) -> str:
    """Genuine revision date from the corpus repository."""
    import subprocess

    result = subprocess.run(
        ["git", "log", "-1", "--format=%ad", "--date=short", "--", f"source/chapters/{file_name}"],
        cwd=CORPUS.parent.parent,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip() or PWI_ORIGIN


def transform(body: str) -> str:
    """The only two edits made to chapter prose."""
    # The layout renders the title, so the chapter H1 and its number come off.
    body = re.sub(r"^# Chapter \d+[:.]?\s*[^\n]*\n+", "", body, count=1)

    # The glossary has a home on the site; other corpus links do not.
    body = body.replace("(../aphorism-glossary.md)", "(/pwi/aphorisms/)")
    body = re.sub(r"\[([^\]]+)\]\(\.\.?/[^)]+\)", r"\1", body)
    return body


def frontmatter(entry: dict, modified: str) -> str:
    section = entry.get("section")
    if section not in ("pwi", "acceptance-testing"):
        raise ValueError(f"{entry['file']}: section must be pwi or acceptance-testing")
    tags = "\n".join(f"  - {tag}" for tag in entry["tags"])
    return (
        "---\n"
        f"title: {entry['title']}\n"
        "description: >-\n"
        f"  {entry['description']}\n"
        f"datePublished: {PWI_ORIGIN}\n"
        f"dateModified: {modified}\n"
        "tags:\n"
        f"{tags}\n"
        f"section: {section}\n"
        f"topic: {entry['topic']}\n"
        f"language: {entry['language']}\n"
        "---\n\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    ready = [c for c in manifest["chapters"] if c["status"] == "ready"]

    if not ready:
        print("Nothing marked ready. Fill in topic, title, description and tags first.")
        return 0

    for entry in ready:
        if entry.get("section") not in ("pwi", "acceptance-testing"):
            print(f"INVALID {entry['file']}: section must be pwi or acceptance-testing", file=sys.stderr)
            return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for entry in ready:
        source = CORPUS / entry["file"]
        if not source.exists():
            print(f"MISSING  {entry['file']}", file=sys.stderr)
            continue

        body = transform(source.read_text(encoding="utf-8"))
        out_name = f"{entry['topic']}-{entry['language']}.md"
        modified = last_modified(entry["file"])

        if args.dry_run:
            print(f"would write {out_name:44} {len(body.splitlines()):5} lines  mod {modified}")
            continue

        (OUT_DIR / out_name).write_text(
            frontmatter(entry, modified) + body, encoding="utf-8", newline="\n"
        )
        entry["status"] = "converted"
        print(f"{out_name:44} {len(body.splitlines()):5} lines  mod {modified}")

    if not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8", newline="\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
