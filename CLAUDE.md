# CLAUDE.md

Personal site for Jeffrey Shi — static HTML/CSS/JS, no build step, deployed on GitHub Pages
from the `main` branch. See [README.md](README.md) for the page map and feature list.

## Frontend aesthetics

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>

### Current design system (the "typeset report", November 2026)

The site is laid out like a printed technical report, not a web app. Jeffrey asked for this
specifically because the previous dark card-grid design read as AI-generated. The reference is
a typeset memo or journal article (RAND reports, Tufte handouts, LaTeX `booktabs` tables).

- **Palette**: ink on warm paper with one spot colour, a rubric red used only for numerals,
  note markers, the active nav underline and the globe's arcs. All colours are CSS custom
  properties in the `:root` block of `css/style.css` (`--paper`, `--ink`, `--ink-2`, `--ink-3`,
  `--rubric`). There is no dark mode; the hidden terminal is the one place the page inverts.
- **Type**: two families only. STIX Two Text (a scientific-publishing face) for everything that
  is read, headings included; Courier Prime for dates, code, the command palette and the
  terminal. Hierarchy comes from size, weight, italics and letterspaced caps, not from more fonts.
- **Structure instead of components**: no cards, chips, pills, gradients, glows, rounded boxes
  or icon tiles. Use hairline rules, numbered sections (CSS counters, numerals hanging in the
  left gutter), margin notes (`.mn` inside a `.has-mn` block), `dl.spec` blocks for metadata,
  `.bt` tables (rules above, under the head, and below; never vertical rules or zebra stripes),
  and the dot-leader contents list (`.toc`). Tags become a "Keywords" line. Buttons (`.btn`)
  are square and reserved for a real action; everything else is an underlined link.
- **Page geometry**: an 80px gutter, a 640px text measure and a 240px margin column
  (`--gutter`, `--measure`, `--margin`). Below 1100px the gutter collapses and numerals go
  inline; below 1000px margin notes fall inline under their paragraph.
- **Fig. 1**: `js/globe.js` draws the home-page globe as ink line work on a 2D canvas (no WebGL,
  no libraries). It floats into the margin with `shape-outside` so the summary wraps the circle.
- **Motion**: one staggered load-in on the title block (`.hero-load`), scroll-triggered
  `.reveal` below it, the typing role line and the cipher-scramble headings. Jeffrey chose to
  keep those last two, plus the `/` palette and the `` ` `` terminal. Don't add more.
- **Voice**: captions, notes and the colophon should be plain and true (the globe caption says
  the arcs are decoration). No invented metrics, IDs, status stamps or role-play framing.
- Before changing the palette or fonts again, reread the aesthetics block above — the goal is a
  cohesive, specific, referenceable aesthetic, not another generic dark-mode SaaS gradient.
