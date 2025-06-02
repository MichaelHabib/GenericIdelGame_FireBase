#!/bin/bash

# Define the source directory and output file
SRC_DIR="docs/_next/"
OUTPUT_FILE="docs/app.js"

# Find all JavaScript files in the source directory and concatenate them
find "$SRC_DIR" -name "*.js" -print0 | sort -z | xargs -0 cat > "$OUTPUT_FILE"

echo "Combined JavaScript files from $SRC_DIR into $OUTPUT_FILE"