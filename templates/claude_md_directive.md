<!-- DNA1-DIRECTIVE-START -->
## Frontend design standard · DNA1 "Evidence Poet"

This project's frontend implementation **must** follow the DNA1 design system. The canonical spec is at [`.claude/design.md`](.claude/design.md) (installed by the `evidence-poet-design-system` skill).

### When this applies

Any work that produces or modifies frontend output — CSS, HTML, React/Vue/Svelte components, SVG assets, color choices, typography, spacing, motion, layout. Includes new code, refactors, and answering visual-design questions.

Does **not** apply to: backend code, data pipelines, build tooling, non-visual documentation.

### Mandatory workflow

1. **Before generating or editing any frontend code**, read [`.claude/design.md`](.claude/design.md). At minimum: §0 token JSON, §3 typography hierarchy, §4 component patterns, §9 guardrails.
2. **Use tokens verbatim** from `.claude/design.md` §0 JSON. Never approximate hex values, font names, or spacing from memory — this is the documented failure mode (see §"Anti-pattern · drift via approximation" in the spec).
3. **Honor the four guardrails** (§9 of the spec) — non-negotiable:
   - **A · Visual DNA**: sharp corners (border-radius: 0), gold accent reserved for "worth-noticing" nodes only, shadows on hover/active state only, no decorative gradients/textures.
   - **B · Type language**: serif for headings only (Playfair Display), sans for body only (Plus Jakarta Sans), mono for labels/nav/CTA only (DM Mono). Never reverse roles.
   - **C · Color discipline (WCAG-bound)**: never use gold `#C8A84B` as text color (fails 2.14:1). Never use grays below `#717171` for body text.
   - **D · Motion restraint**: single easing `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce/elastic/parallax/auto-play-without-disclosure.
4. **Spacing** comes only from the 4px-rooted scale (§5): `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 120`. No arbitrary values.
5. **Self-check before declaring done**: every color, font, border-radius, spacing, shadow, and easing value is traceable to a token in §0 JSON or a rule in §2/§3/§4/§5/§6/§9.

### Quick reference (cheat sheet)

```
Background:  #F8F7F3    CTA text:    #527590
Ink Black:   #1A1A18    Subtitle:    #555
Gold accent: #C8A84B    Caption:     #666 (and never as text color)
Border:      #EDE9E2    Label:       #717171

Headings: Playfair Display, 700, serif
Body:     Plus Jakarta Sans, 400, sans-serif
Labels:   DM Mono, 400, monospace · uppercase · 0.03–0.06em tracking

Border-radius: 0 (everywhere)
Easing:        cubic-bezier(0.16, 1, 0.3, 1)
Shadow:        hover/active only · 0 2px 12px rgba(0,0,0,0.06)
```

Cheat sheet is for orientation only — for any actual implementation, read `.claude/design.md` directly.

### Updating

Re-run the `evidence-poet-design-system` skill to refresh `.claude/design.md` and this directive to the latest spec. The skill is idempotent — it asks before overwriting.
<!-- DNA1-DIRECTIVE-END -->
