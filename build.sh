#!/usr/bin/env bash
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
    cp -vr ${SRC_DIR}/* ${BUILD_DIR};

# convert md to html files
echo "Converting files using pandoc..."
find ${BUILD_DIR} \
    -iname "*.md" \
    -type f \
    -print \
    -exec sh -c 'pandoc -f gfm -t html "${0}" -s --template '${BUILD_DIR}'/templates/basic.html.pandoc -c "/css/deadagent.css" -o "'${BUILD_DIR}'/$(basename ${0%.md}.html)"' {} \;

# copy from tmp to dist
echo "Making dist..."
mkdir -p ${DIST_DIR};
rm -rf ${DIST_DIR}/*;
cp -vr ${BUILD_DIR}/* ${DIST_DIR}/;
echo "Removing temp build dir..."
rm -rf ${BUILD_DIR}/*;
echo "Done."