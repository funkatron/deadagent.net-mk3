#!/usr/bin/env bash
#
# This devserver.sh uses `entr`: http://eradman.com/entrproject/, https://github.com/eradman/entr/
# It will re-run ./build.sh every time a file changes in ./src

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";
SRC_DIR="${SCRIPT_DIR}/src"
DIST_DIR="${SCRIPT_DIR}/dist"

# First, make sure the dist directory exists
mkdir -p ${DIST_DIR};

# Then we start the node-based http server that will serve the contents of ./dist/
# See https://www.npmjs.com/package/http-server
# Note the options we pass. For ex, `-c-1` disables caching entirely.
http-server "${SCRIPT_DIR}/dist/" -o -i -d --no-dotfiles -c-1 &
# The trailing ampersand puts this process into the background.

# Now start listening for changes in the background
while sleep 0.5; do
    find "${SCRIPT_DIR}/src/" | entr -d ./build.sh;
done && fg