# Jeffrey Shi — Personal Website

**Live at https://js430.github.io/** (GitHub Pages user site, `main` branch —
push to deploy; `.nojekyll` keeps the build a plain file copy).

Static personal site laid out like a typeset technical report: ink on warm paper, one
spot colour, STIX Two Text for reading and Courier Prime for data. Numbered sections,
margin notes and ruled tables instead of cards and chips. No build step and no
JavaScript dependencies; the only third-party requests are Google Fonts (styles only).

## Pages

| Page | File | Notes |
|------|------|-------|
| Home | `index.html` | Title block with the ink-line globe (Fig. 1), about, what I do, contact |
| Projects | `projects.html` | Professional work as numbered entries with margin specs |
| Personal | `personal.html` | Ava Discord bot and Nexus Card Co — contents list, 13 entries |
| Resume | `resume.html` | Interactive resume: tabs, expandable timeline, skills table, PDF download |

## Features

- Wireframe globe drawn on a 2D canvas (`js/globe.js`, no WebGL or libraries): graticule,
  hatched shadow, animated great-circle arcs, drag to turn. Static for
  `prefers-reduced-motion`; paused off-screen. Text wraps the circle via `shape-outside`.
- Staggered load-in on the title block; cipher-scramble headings on scroll reveal;
  typing rotation on the home role line
- Command palette: press `/` anywhere (`help`, `projects`, `personal`, `resume`,
  `download`, `terminal`…)
- Hidden terminal: press `` ` `` — canned client-side shell with navigation, resume
  download, `about`/`skills`/`contact`/`whoami`
- Resume: tabbed sections, expandable timeline, and a print stylesheet so print-to-PDF
  produces a clean paper resume
- Live UTC clock in the colophon

## Content status

Populated from the Sept 2026 resume (threat-intel focused); `assets/Jeffrey_Shi_Resume.pdf`
is the real, downloadable resume (phone number deliberately scrubbed for the public copy;
clearance status is on the PDF as Jeffrey wrote it, but deliberately not repeated anywhere
in the site's own text).

## Local preview

Any static server works, e.g.:

```
python -m http.server 4173
```

then open http://localhost:4173.
