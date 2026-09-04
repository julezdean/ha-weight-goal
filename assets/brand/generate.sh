#!/usr/bin/env bash
# Renders the brand icons from assets/weight_goal_icon.svg.
# Re-run after replacing the source SVG:  bash assets/brand/generate.sh
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=assets/weight_goal_icon.svg
OUT=custom_components/weight_goal/brand
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# dark theme: lighter blue for contrast on dark backgrounds, slightly stronger band
sed -e 's/#2563eb/#60a5fa/g' \
    -e 's/fill-opacity="0.14"/fill-opacity="0.18"/' \
    -e 's/opacity="0.55"/opacity="0.60"/g' \
    "$SRC" > "$TMP/dark.svg"
cp "$SRC" "$TMP/light.svg"

render() {  # <svg> <size> <pad> <target>
  rsvg-convert -w 2048 -h 2048 "$1" -o "$TMP/big.png"
  magick "$TMP/big.png" -trim +repage \
    -resize "$(( $2 - 2 * $3 ))x$(( $2 - 2 * $3 ))" \
    -background none -gravity center -extent "$2x$2" \
    -strip "$4"
}

render "$TMP/light.svg" 256 10 "$OUT/icon.png"
render "$TMP/light.svg" 512 20 "$OUT/icon@2x.png"
render "$TMP/dark.svg"  256 10 "$OUT/dark_icon.png"
render "$TMP/dark.svg"  512 20 "$OUT/dark_icon@2x.png"

file "$OUT"/*icon*.png
