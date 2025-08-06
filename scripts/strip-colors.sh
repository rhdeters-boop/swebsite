#!/bin/bash
# Strip ANSI color codes from stdin and write to file
sed 's/\x1b\[[0-9;]*m//g' > "$1"
