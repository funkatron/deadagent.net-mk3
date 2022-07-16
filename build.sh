#!/usr/bin/env bash

# some of the older files from funkatron.com have a .html extension, but contain
# YAML front matter and the HTML content fragment. Therefore we need to grab
# both *.md and *.html
# MARKDOWN_FILE_EXTENTIONS='*.md *.html'

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]:-$0}"; )" &> /dev/null && pwd 2> /dev/null; )";

TEMP_DIR='/tmp'
BUILD_ID=`date +%Y-%m-%d-%H-%M-%S`_`echo $RANDOM | md5`
BUILD_DIR="${TEMP_DIR}/${BUILD_ID}"

SRC_DIR="${SCRIPT_DIR}/src"
DIST_DIR="${SCRIPT_DIR}/dist"

# copy to tmp
echo "Copying src to temp build dir..."
mkdir -p ${BUILD_DIR} && \
    rm -rf ${BUILD_DIR}/* && \
    cp -r ${SRC_DIR}/* ${BUILD_DIR};

# rename all *.html files to *.md on MacOS


# echo "Renaming *.html files to *.md..."
# find ${BUILD_DIR} -name '*.html' -exec rename 's/\.html/.md/' {} \;

# convert YAML front matter + markdown -> HTML
CONVERT_CMD_MD='pandoc -d '${SCRIPT_DIR}'/pandoc.yml -f gfm-autolink_bare_uris -t html "${0}" -s --template '${BUILD_DIR}'/templates/basic.html.pandoc -c "/css/deadagent.css" -o "${0%.md}.html"'

echo "Converting files using pandoc command: ${CONVERT_CMD_MD}"
find ${BUILD_DIR} \
    -type f \
    -iname "*.md" \
    -print \
    -exec sh -c "$CONVERT_CMD_MD" {} \;

# copy from tmp to dist
echo "Making dist..."
mkdir -p ${DIST_DIR};
rm -rf ${DIST_DIR}/*;
cp -r ${BUILD_DIR}/* ${DIST_DIR}/;
echo "Removing temp build dir..."
rm -rf ${BUILD_DIR}/*;
echo "Done."