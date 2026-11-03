#!/usr/bin/env python3
"""Build the GitHub Pages site into _site/.

  /       the landing page (site/)
  /app/   the app itself, wrapped in a full HTML document

The app's index.html is written as a page fragment (no <html>/<head>/<body>) because the
Claude artifact host adds those. This script adds them for GitHub Pages and copies the
app's css/, js/ and data/ next to it. Run it locally with:  python3 tools/build_site.py
"""
import pathlib
import shutil

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"

shutil.rmtree(OUT, ignore_errors=True)
shutil.copytree(ROOT / "site", OUT)
app = OUT / "app"
app.mkdir()
for folder in ("css", "js", "data"):
    shutil.copytree(ROOT / folder, app / folder)

fragment = (ROOT / "index.html").read_text(encoding="utf-8")
fragment = fragment.replace('<meta charset="utf-8">\n', "", 1)
split = fragment.index('<div class="wrap">')
head, body = fragment[:split].strip(), fragment[split:].strip()

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Write lyrics over your beat with rhyme colours, a rhyme finder, a bar vault and BPM/key detection. Everything stays in your browser.">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<style>body {{ margin: 0; }} img {{ max-width: 100%; }}</style>
{head}
</head>
<body>
{body}
</body>
</html>
"""
(app / "index.html").write_text(page, encoding="utf-8")
(OUT / ".nojekyll").write_text("", encoding="utf-8")
print(f"Built {OUT.relative_to(ROOT)}/ (landing page + app/)")
