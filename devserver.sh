#!/usr/bin/env bash
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

while sleep 0.5; do
    find "${SCRIPT_DIR}/src/" | entr -d ./build.sh;
done