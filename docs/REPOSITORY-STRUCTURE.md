# Proposed repository structure

```text
content/
  airlines/                 one readable file per airline
assets/
  css/                      visual system and homepage experience
  js/                       site behaviour and generated content
  img/                      approved logos, liveries and photography
tools/
  content-pipeline.js       validates and joins content
  build-pages.js            generates the static HTML pages
  test.js                   checks routes, codes, artwork and contrast
docs/
  DISCORD-SUBMISSIONS.md    planned member-intake workflow
*.html                      generated output served by GitHub Pages
```

This is an incremental reorganisation, not a framework rewrite. It keeps GitHub Pages, avoids a database and preserves the existing booking and globe code. The next clean-up step—after the workflow is accepted—is to split airports, lounges, press releases and alliance settings into `content/` as well, then remove their temporary copies from `assets/js/data.js`.
