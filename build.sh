#!/usr/bin/env bash

# copy to tmp
mkdir -vp /tmp/_build;
rm -vrf /tmp/_build/*;
cp -vr ./src/* /tmp/_build;

# convert md to html files
find /tmp/_build -iname "*.md" -type f -exec sh -c 'pandoc "${0}" -s -c "/css/deadagent.css" -o "/tmp/_build/$(basename ${0%.md}.html)"' {} \;

# copy from tmp to dist
mkdir -vp ./dist;
rm -vrf ./dist/*;
cp -vr /tmp/_build/* ./dist/;