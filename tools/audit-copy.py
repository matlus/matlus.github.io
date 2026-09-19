#!/usr/bin/env python3
"""Supplementary copy audit for matlus.com.

This does NOT replace the professional-writing skill's own `audit.py`, which
carries the full banned-word and banned-phrase lists and should be run while
drafting. This script covers two things that script cannot:

1.  The bare-antithesis family. The skill catches "Not just X, but Y",
    "It's not just about X, it's about Y", and "X matters, and it's not Y".
    It does not catch plain negation-parallelism with no "just" and no
    "matters": "The reason is retrieval, not authoring." / "The date isn't
    the problem, the feed is." Those are the commonest form in practice.

2.  A stable CI check. The skill's script lives under a session-specific
    plugin path, so CI cannot invoke it. The punctuation rules duplicated
    here are the ones that are both high-signal and unlikely to drift.

Scope: prose only. Code fences, tables, headings, and blockquotes are
skipped, because a `!==` in a code sample is not a writing tic.

Exit codes: 0 clean, 1 hard violations found.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

EM_DASH = "—"
ELLIPSIS = "…"


@dataclass(frozen=True)
class Rule:
    """One named check. `hard` rules fail the build, advisory ones only report."""

    label: str
    pattern: re.Pattern[str]
    hard: bool
    hint: str
    # Word-pattern rules match against lowercased text. Punctuation rules match
    # the raw line, since case is irrelevant to them either way.
    lowercase: bool = True


RULES: tuple[Rule, ...] = (
    Rule(
        label="em dash",
        pattern=re.compile(EM_DASH),
        hard=True,
        hint="Use a comma, period, colon, or parentheses.",
        lowercase=False,
    ),
    Rule(
        label="ellipsis character",
        pattern=re.compile(ELLIPSIS),
        hard=True,
        hint="Use three separate periods, sparingly.",
        lowercase=False,
    ),
    # Both separators matter. The comma form ("isn't X, Y is") and the
    # semicolon form ("is not X; Y is") are the same tic, and inline markup
    # such as *feed* or `feed` can sit between the separator and the subject.
    Rule(
        label="antithesis: negation then parallel affirmation",
        pattern=re.compile(
            r"\b(?:is|are|was|were)(?:n't|\s+not)\b[^.!?]{0,70}[,;]\s*"
            r"[*`_]{0,2}(?:it|that|the|they)\b[^.!?]{0,70}"
            r"\b(?:is|are|was|were)\b\s*[.;]"
        ),
        hard=True,
        hint="State the positive claim directly and drop the negated half.",
    ),
    Rule(
        label="antithesis: trailing ', not X.'",
        pattern=re.compile(r",\s+not\s+[a-z][\w-]*(?:\s+[a-z][\w-]*){0,2}\s*[.;]"),
        hard=False,
        hint="Sometimes correct. Check it is a real contrast, not manufactured emphasis.",
    ),
    Rule(
        label="antithesis: 'not because X, but because Y'",
        pattern=re.compile(r"\bnot\s+because\b[^.!?]{1,80},\s*but\s+because\b"),
        hard=True,
        hint="Give the actual reason without staging a false one first.",
    ),
    Rule(
        label="dramatic qualifier: 'the X that actually Y'",
        pattern=re.compile(r"\bthe\s+\w+\s+that\s+actually\s+\w+"),
        hard=False,
        hint="Usually manufactured emphasis. Prefer a plain statement.",
    ),
    Rule(
        label="dismissive framing: \"is not the problem/point/issue\"",
        pattern=re.compile(
            r"\b(?:is|are|was|were)(?:n't|\s+not)\s+the\s+"
            r"(?:problem|point|issue|question|hard\s+part)\b"
        ),
        hard=True,
        hint="Say what the problem is without first naming what it is not.",
    ),
)

SKIP_PREFIXES = ("|", "#", "```", ">", "---", "    ", "\t")


def prose_lines(text: str) -> list[tuple[int, str]]:
    """Return (line_number, line) for prose lines only, skipping fenced code."""
    lines: list[tuple[int, str]] = []
    in_fence = False

    for number, raw in enumerate(text.splitlines(), start=1):
        stripped = raw.strip()

        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence or not stripped:
            continue
        if raw.startswith(SKIP_PREFIXES) or stripped.startswith(SKIP_PREFIXES):
            continue

        lines.append((number, raw))

    return lines


def audit(path: Path) -> tuple[int, int]:
    """Report violations in one file. Returns (hard_count, advisory_count)."""
    text = path.read_text(encoding="utf-8")
    hard = 0
    advisory = 0

    for number, line in prose_lines(text):
        lowered = line.lower()
        for rule in RULES:
            haystack = lowered if rule.lowercase else line
            if rule.pattern.search(haystack) is None:
                continue

            severity = "HARD" if rule.hard else "ADVISORY"
            if rule.hard:
                hard += 1
            else:
                advisory += 1

            print(f"{path}:{number}: {severity} {rule.label}")
            print(f"    {line.strip()}")
            print(f"    -> {rule.hint}")

    return hard, advisory


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="*",
        default=["src", "docs"],
        help="Files or directories to audit. Defaults to src and docs.",
    )
    args = parser.parse_args()

    targets: list[Path] = []
    for entry in args.paths:
        path = Path(entry)
        if path.is_dir():
            targets.extend(sorted(path.rglob("*.md")))
            targets.extend(sorted(path.rglob("*.astro")))
        elif path.is_file():
            targets.append(path)

    if not targets:
        print("No files to audit.")
        return 0

    total_hard = 0
    total_advisory = 0
    for target in targets:
        hard, advisory = audit(target)
        total_hard += hard
        total_advisory += advisory

    print()
    print(f"Audited {len(targets)} file(s): {total_hard} hard, {total_advisory} advisory.")

    if total_hard:
        print("Hard violations must be fixed.")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
