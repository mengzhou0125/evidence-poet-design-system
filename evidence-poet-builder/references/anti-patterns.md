# DNA1 Anti-Patterns

Read this before writing any code. The four guardrails are non-negotiable; the
user-strict rules are hard rules; the extension governance keeps the system coherent as
it grows. Most framework defaults (rounded corners, drop shadows, decorative icons)
violate DNA1 — you must override them explicitly.

---

## The four guardrails (from `dna1-spec.md` §9 · never bend)

### A · Visual DNA
- ✓ Sharp corners — `border-radius: 0` on every element, no exceptions. Precision over friendliness.
- ✓ Gold marks only worth-noticing nodes — scarcity is the signal.
- ✓ Shadows mark engagement — on hover, or as an explicit active/featured state. Never decorative.
- ✗ Decorative gradients · textures · patterns.

### B · Type language (each role in its own register)
- ✓ Serif (Playfair Display) → narrative authority — headings only.
- ✓ Sans (Plus Jakarta Sans) → readable body — paragraphs only.
- ✓ Mono (DM Mono) → precise annotation — labels · nav · CTA only.
- ✗ Reversing roles — serif body, sans heading.

### C · Color discipline (WCAG-bound)
- ✓ All colors via design tokens.
- ✗ Gold (`#C8A84B`) as text — fails WCAG (2.14:1). Gold is for lines and accents only.
- ✗ Sub-`#717171` grays for body text — fails WCAG. `#717171` is the floor (4.55:1).

### D · Motion restraint (invited, never volunteered)
- ✓ Single easing — `cubic-bezier(0.16, 1, 0.3, 1)`.
- ✗ Bounce / elastic / overshoot.
- ✗ Auto-play without disclosure.
- ✗ Parallax · scroll choreography · staged delays.

---

## User-strict rules (hard rules · above and beyond the guardrails)

### 1 · Zero emoji icons — anywhere

No emoji in any UI, artifact, file content, or status signal. Common offenders, all
banned: 🟢🟡🔴 ✅❌ ⚠ 🚦 🚩 🔥 🎯 ✨ 🚀 🤖 📌 📊 💡 🐛.

Replace with a CSS swatch + a text label:
```html
<span class="swatch swatch--green"></span> Green env
```
or a text pill: `<span class="env-pill env-pill--green">Green</span>`. The swatch is a
small solid block (e.g. 6×6px); the text carries the meaning.

### 2 · Zero rounded corners

`border-radius: 0` globally. If a component framework defaults to rounded (MUI, Chakra,
shadcn defaults), override it explicitly with a global reset:
```css
*, *::before, *::after { border-radius: 0; }
```

### 3 · No decorative shadows

Only `--shadow-hover: 0 2px 12px rgba(0,0,0,0.06)` is canon. No drop-shadows beyond it,
no glow, no neumorphism. Default state is flat; depth appears on engagement (hover) or an
explicit featured state.

### 4 · No hardcoded values

Never write a literal hex / px / font-family outside the token set. In CSS use
`var(--token)`; in vanilla / SVG use the `dna1-spec.md` §0 JSON values directly and
comment them as DNA1 tokens. Spacing comes only from the 4px-rooted scale.

### 5 · No gold overuse

Gold `#C8A84B` is scarce — only where it earns the eye (an active state, a gold line
under a selected tab, a pause moment). Not for body text, not for large background
blocks, not for every button.

---

## Extension governance (adding non-canonical tokens)

Some builds genuinely need values the spec does not have — status colors for a data
dashboard, severity colors for a review tool. These are **extensions**. Five rules:

1. **Namespace prefix mandatory** — never collide with a base token. Use a clear prefix:
   `--review-*` · `--bright-*` · `--severity-*` · `--<consumer>-*`.
2. **WCAG rationale inline** — for any color used with or behind text, document the
   contrast ratio in a comment next to the token.
3. **Derivation explicit** — if an extension derives from a base token, state the lineage
   (`--color-accent-dark` derived from `--color-accent` for text-bearing use), don't
   paste a raw hex eyeballed from memory.
4. **Live with the consumer** — extension tokens belong in the consumer's own token file
   / `<style>` block, NOT in the canonical `dna1-spec.md` §0.
5. **Cross-consumer convergence triggers promotion** — if two or more builds independently
   invent the same semantic extension (e.g. a severity scale), that is a signal it should
   become canonical — propose adding it to the spec rather than re-inventing a third time.

**The anti-pattern this prevents — drift via approximation**: eyeballing a "close enough"
hex from memory, with no WCAG rationale and no lineage. A consumer that does this drifts
silently from the design language. Every value is either a canonical token or a governed,
namespaced, documented extension. There is no third category.

---

## Quick self-check before declaring a build done

- [ ] Every corner is sharp (`border-radius: 0`) — including framework-default components
- [ ] Three fonts, roles not reversed (serif heading · sans body · mono label)
- [ ] Zero emoji — status signals use CSS swatch + text
- [ ] Zero hardcoded hex / px / font outside tokens (or governed namespaced extensions)
- [ ] Gold used only on accent lines / active states — never as text, never decorative
- [ ] Shadows only on hover or explicit featured state — default state flat
- [ ] Motion uses the single easing curve — no bounce, no parallax, no silent autoplay
- [ ] Body text grays at or above the `#717171` WCAG floor
- [ ] Any extension token is namespaced + WCAG-documented + derivation-explicit
