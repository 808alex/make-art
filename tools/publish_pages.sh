#!/usr/bin/env bash
# Build the site and push it to the gh-pages branch, which GitHub Pages serves.
# Usage: tools/publish_pages.sh   (run from the repo root)
set -euo pipefail
python3 tools/build_site.py
tmp="$(mktemp -d)"
cp -r _site/. "$tmp"/
cd "$tmp"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Publish site from $(git -C "$OLDPWD" rev-parse --short HEAD)"
git push -q -f "$(git -C "$OLDPWD" remote get-url origin)" gh-pages
cd "$OLDPWD"
rm -rf "$tmp"
echo "Published to gh-pages"
