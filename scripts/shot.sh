#!/usr/bin/env bash
# Captura headless: scripts/shot.sh <url> <saida.png> [largura] [altura]
# Mobile-first: padrão 390x844 (iPhone 14). Use altura grande pra página inteira.
URL=${1:-http://localhost:4317/}; OUT=${2:-shot.png}; W=${3:-390}; H=${4:-844}
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=old --mute-audio --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --virtual-time-budget=6000 --window-size=$W,$H --screenshot="$(cygpath -w "$OUT" 2>/dev/null || echo "$OUT")" "$URL" 2>/dev/null
echo "$OUT"
