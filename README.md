# kaidenpenney.github.io

Personal site — Kaiden Penney, B.S. Computer Science, Washington State University.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no dependencies.
The only external request is the Google Fonts stylesheet.

## Structure

```
index.html                      the whole page
assets/
  styles.css                    design tokens + all layout
  main.js                       scroll reveals, nav scroll-spy, theme toggle, email decode
  headshot.jpg                  1000x1000, 129 KB
  favicon.svg                   navy "KP" monogram
  KaidenPenney_Resume_SWE.pdf   linked from the nav, hero and contact section
.nojekyll                       tells GitHub Pages to serve files as-is
```

## Deploying to GitHub Pages

The repository **must** be named `KaidenPenney.github.io` — that exact name is what
gives you the root domain rather than a `/subpath`.

With the GitHub CLI, from inside this folder:

```bash
git init && git add . && git commit -m "Personal site" && gh repo create KaidenPenney.github.io --public --source=. --push
```

Without the CLI: create a public repo named `KaidenPenney.github.io` on GitHub, then:

```bash
git init && git add . && git commit -m "Personal site" && git branch -M main && git remote add origin https://github.com/KaidenPenney/KaidenPenney.github.io.git && git push -u origin main
```

Then in the repo: **Settings → Pages → Source → Deploy from a branch → `main` / `/ (root)`**.
The site appears at `https://kaidenpenney.github.io` within a couple of minutes.

To preview locally before pushing, any static server works:

```bash
npx serve .
```

## Updating content

Everything lives in `index.html`, in clearly commented sections
(`<!-- ==================== PROJECTS ==================== -->` and so on).

- **Add a project** — copy an existing `<article class="card">` block and edit it.
  The grid reflows on its own; no CSS change needed.
- **Move a project out of "Now"** — delete its `<li>` from the `NOW` section and add a
  card in `PROJECTS`.
- **Add a term to the transcript** — copy a `<section class="term">` block. Grades with
  a `data-g` starting in `A` render green automatically; use `&mdash;` for in-progress.
- **Swap the resume** — replace `assets/KaidenPenney_Resume_SWE.pdf`, keeping the filename,
  or update the three links that reference it.

### Colors and type

All color lives in CSS custom properties at the top of `styles.css`, defined three
times: once on `:root` (light), once under `prefers-color-scheme: dark`, and once under
`[data-theme="dark"]` so the manual toggle wins. Change a token in all three places, not
the rules that use it.

Type is Newsreader (headings), IBM Plex Sans (body), IBM Plex Mono (dates, course codes,
labels).

## Notes

- The email address is stored base64-encoded in `data-e` and decoded by `main.js`, so
  address-harvesting crawlers get nothing readable. A human-readable fallback
  (`mrpenney1030 (at) gmail.com`) shows if JavaScript is off.
- Scroll reveals use a rect sweep rather than an IntersectionObserver, specifically so
  that jumping to a section — a nav click, a `#deep-link`, or browser scroll restoration —
  can never leave skipped content stranded at `opacity: 0`.
- `prefers-reduced-motion` disables every transition and shows all content immediately.
- With JavaScript disabled the page is still fully readable; the reveal system is gated
  behind a `has-js` class.
