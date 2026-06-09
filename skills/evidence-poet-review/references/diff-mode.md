# DIFF mode · incremental re-review

When a document was already reviewed once, the user edited it, and now wants a **re-review
focused on the delta** — not "re-review the whole doc". DIFF mode keeps the review focused
on what changed without dragging the entire doc through another full pass.

---

## When to run DIFF mode

- The artifact was reviewed before · a `<doc-stem>_review_v<N-1>.html` exists
- The source doc has been edited since · usually has a Version section / changelog
- The user wants confirmation that prior findings are addressed + flags any new issues the
  edits introduced

When to **not** run DIFF mode:

- First review of the artifact → standard FULL mode
- The artifact was rewritten >50% → run FULL mode (the delta concept doesn't apply)
- The prior review was rejected wholesale and the user is starting over → FULL mode

---

## 4 visual mechanisms · all on together

### (1) Section-level state tag · `🆕 NEW / ✏️ EDITED / 🔁 RESTRUCTURED / ✅ UNCHANGED`

Every section gets a state tag right next to its `.section-label`:

```html
<p class="section-label">§3 · Methodology  <span class="state-tag state-tag--edited">✏️ EDITED</span></p>
```

State tag CSS (add to your review HTML's `<style>` block — these are review-instance
extensions, not in `components.css`):

```css
.state-tag {
  display: inline-block; font-family: var(--font-mono);
  font-size: var(--font-size-3xs); font-weight: 700; letter-spacing: 0.06em;
  padding: var(--hairline) 6px; text-transform: uppercase; margin-left: var(--space-xs);
  color: var(--color-on-dark);
}
.state-tag--new          { background: var(--review-tech-status-rev); }   /* blue-gray */
.state-tag--edited       { background: var(--review-tech-status-kept); }  /* gold-dark */
.state-tag--restructured { background: var(--review-tech-layer-b); }      /* plum */
.state-tag--unchanged    { background: var(--color-text-muted); }         /* gray */
```

### (2) Changed-section visual highlight

Sections tagged NEW · EDITED · RESTRUCTURED get `.section--changed`:

```css
section.section.section--changed {
  background: var(--review-改-light);                /* soft gold tint */
  border-left: var(--line-accent) solid var(--color-accent);   /* gold changebar */
  padding-left: var(--space-md);
}
```

### (3) Unchanged-section folded + dimmed

Sections tagged UNCHANGED **collapse to one line** + drop opacity:

```css
section.section.section--unchanged { opacity: 0.55; }
```

The body of an unchanged section becomes a single line:

```html
<section class="section section--unchanged">
  <p class="section-label">§5 · Background  <span class="state-tag state-tag--unchanged">✅ UNCHANGED</span></p>
  <p style="color: var(--color-text-faint); font-style: italic;">
    ✅ unchanged since v&lt;N-1&gt; · folded
  </p>
</section>
```

This collapses the visual real estate the section consumes from "full prose" to "one line"
— the reader scrolls past quickly, focusing on the changed sections.

### (4) Rationale rail trimmed

- **Unchanged sections** — rail content reduces to one dashed line:
  `<div class="rationale rationale-empty">通审 · v&lt;N-1&gt; 状态保持 ✅</div>` (or
  English equivalent — "passed · v<N-1> status retained ✅")
- **Changed sections** — rail content **doubles** with two parts:
  1. **What changed** — quoted delta · how the new content differs from v<N-1>
  2. **New findings introduced?** — any P0/P1 the edit accidentally introduced

---

## Source-of-diff strategy · how the AI knows what changed

Priority order:

1. **Read the source doc's Version section / changelog** — most internal docs (BP / workflow /
   biweekly / spec) carry a Version section with per-version "what changed" notes. **Default
   to this.** Cheap · authoritative.

2. **Ask the user** — "Which sections changed since v<N-1>?" — when the source doc has no
   Version section (typical of code · ad-hoc drafts · single-file docs) or when the Version
   section is too high-level to map to sections.

3. **Diff prior review HTML against latest source · AI computes** — last resort. Expensive
   (read 2 docs · compute structural diff · interpret). Use only when (1) and (2) both fail.

If you can't determine what changed with confidence, **stop and ask the user** rather than
guessing. A DIFF mode review that mis-tags the changed sections is worse than a FULL review.

---

## Overview-box · DIFF row

Add a row to the top `.summary-block` or `.audit-box`:

```html
<tr>
  <td><b>Changes since v&lt;N-1&gt;</b></td>
  <td>🆕 NEW: 1 · ✏️ EDITED: 3 · 🔁 RESTRUCTURED: 0 · ✅ UNCHANGED: 5</td>
</tr>
```

So the reader sees the delta scope before scrolling.

---

## Meta-bar must say DIFF mode

The top meta-bar's title line should explicitly tag the mode so the reader knows this isn't
a full review:

```html
<div class="meta-bar">
  <b>Doc · review v3 · (post-v2-fix · DIFF mode)</b> · Updated 2026-06-09
  <br><b>How to read</b>: changed sections (NEW / EDITED / RESTRUCTURED) have gold tint +
  changebar; unchanged sections fold to one line. Focus on the gold-tinted.
</div>
```

---

## Naming

DIFF mode follows the same naming as FULL mode:

`<doc-stem>_review_v<N>.html` · N increments · don't overwrite v<N-1>.

The `(post-v<N-1>-fix · DIFF mode)` marker in the meta-bar is the only signal that this is
incremental vs full. Both modes are equal-status reviews; the distinction is process, not
artifact hierarchy.

---

## Patterns evaluated · not adopted

These were considered for DIFF mode and rejected — explicit for completeness so future
sessions don't re-derive and re-litigate:

- **Paragraph-level highlighting** — too granular for short paragraphs · adds visual noise on
  long ones · section-level changebar is sufficient for navigation
- **Sticky jump-nav at top** — most maintenance re-reviews have ≤3 changed sections · the
  left ToC + section state tags already serve · sticky nav adds noise without proportional
  value
- **Diff strikethrough on removed text** — readers find strikethrough fatiguing on prose ·
  the `.r-compare` before/after block in the rationale handles this when needed

---

## DIFF mode + FULL mode boundary

If during a DIFF mode review you discover that the changes are larger than expected — e.g.,
what the changelog called "minor edit" was a structural rewrite of 3 sections — **switch to
FULL mode for those sections** (drop the `.section--changed` styling, give them full
annotation treatment). The DIFF mode envelope is for sections actually delta-sized; bigger
edits get full treatment.

Don't switch the whole HTML back to FULL mode mid-review — the meta-bar already announced
DIFF mode; the per-section escape valve is enough.
