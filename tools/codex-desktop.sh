#!/usr/bin/env bash
#
# Run the Codex *desktop app's* bundled binary rather than the standalone CLI.
#
# The desktop app updates itself, so its binary is ahead of a separately
# installed `codex` on PATH. At the time of writing the CLI was 0.147.0 and
# refused to run: its default model returned "requires a newer version of
# Codex", while the desktop build was 0.155.0-alpha.9.2 and worked.
#
# The binary lives under a content-hashed directory that changes on every
# update, so hardcoding the path breaks silently. This resolves the newest one
# by modification time instead.
#
#   tools/codex-desktop.sh exec "your prompt"
#
set -euo pipefail

BIN_ROOT="${LOCALAPPDATA:-$HOME/AppData/Local}/OpenAI/Codex/bin"

if [[ ! -d "$BIN_ROOT" ]]; then
  echo "Codex desktop app not found at: $BIN_ROOT" >&2
  echo "Install the desktop app, or use the 'codex' CLI on PATH." >&2
  exit 1
fi

# Newest codex.exe by modification time. An update adds a new hashed directory
# rather than replacing the old one, so the directories accumulate.
newest=""
newest_time=0
for candidate in "$BIN_ROOT"/*/codex.exe; do
  [[ -f "$candidate" ]] || continue
  mtime=$(stat -c %Y "$candidate" 2>/dev/null || echo 0)
  if (( mtime > newest_time )); then
    newest_time=$mtime
    newest="$candidate"
  fi
done

if [[ -z "$newest" ]]; then
  echo "No codex.exe found under $BIN_ROOT" >&2
  exit 1
fi

if [[ "${1:-}" == "--which" ]]; then
  echo "$newest"
  "$newest" --version
  exit 0
fi

exec "$newest" "$@"
