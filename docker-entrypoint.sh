#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/app}"
INPUT_DIR="${INPUT_DIR:-/data/in}"
OUTPUT_DIR="${OUTPUT_DIR:-/data/out}"
BUNDLE_LANG="${BUNDLE_LANG:-pt}"

if [ "$#" -gt 0 ]; then
  exec node "$APP_DIR/cli.js" "$@"
fi

mkdir -p "$OUTPUT_DIR"

processed=0

for file in "$INPUT_DIR"/*.h5p "$INPUT_DIR"/*.H5P; do
  if [ ! -f "$file" ]; then
    continue
  fi

  base_name="$(basename "$file")"
  name_without_ext="${base_name%.*}"
  output_file="$OUTPUT_DIR/$name_without_ext.html"

  echo "Converting: $file -> $output_file"
  node "$APP_DIR/cli.js" "$file" -o "$output_file" --lang "$BUNDLE_LANG"
  processed=$((processed + 1))
done

if [ "$processed" -eq 0 ]; then
  echo "No .h5p files found in $INPUT_DIR"
  exit 0
fi

echo "Done. Converted $processed file(s)."
