# Tag Profiles · Editorial vs Technical

DNA1 review-HTML supports **two tag schemas**. Pick one per review HTML — they share the
same outer frame (`tokens.css` + `components.css` + layout archetypes) but the chips and
their semantics differ. Both are CSS extensions per the DNA1 §"Extension governance" rule
— every color carries an inline WCAG contrast comment.

| Profile | Use case | Schema | Cardinality |
|---|---|---|---|
| **A · Editorial** | case study revision · doc rewrite · narrative content · blog draft | 3 status × 4 layer | 12 combos + 3-level audit-box severity gradient (informational) |
| **B · Technical** | code · spec · architecture · cross-layer audit · API review | 3 axes × 3 variants | 9 distinct colors (3 status + 3 layer + 3 severity) |

---

## Profile A · Editorial review

**Schema · Status × Layer = orthogonal classification**. Every proposed change carries **two
tags simultaneously** — a status (what action) and a layer (what design dimension).

### Status axis · 3 values (action type · warm chromatic)

| Status | CSS | Color | WCAG | Meaning |
|---|---|---|---|---|
| **改** modified | `.change-tag` | gold-dark `#7E6720` | 5.5:1 white-on | rewrite the text |
| **原** kept | `.change-tag.kept` | gray `#717171` | 4.6:1 white-on | keep original |
| **删** deleted | `.change-tag.del` | terracotta `#A85F4D` | 4.8:1 white-on | remove entirely |

### Layer axis · 4 values (design dimension · cool/earth chromatic)

| Layer | CSS | Color | WCAG | Meaning |
|---|---|---|---|---|
| **A 故事** | `.r-tag.layer-a` | cool blue `#3D5C73` | 7.1:1 white-on | capability signal · story arc · narrative spine |
| **B 分层** | `.r-tag.layer-b` | olive `#5E5840` | 7.5:1 white-on | body ↔ caption layering · concept ↔ detail split |
| **C 去拉踩** | `.r-tag.layer-c` | plum `#6A4A6E` | 7.5:1 white-on | remove ego · soften absolutes · drop self-praise |
| **D 精简** | `.r-tag.layer-d` | slate `#4A4A45` | 10.2:1 white-on | density · dedup · shorten |

### Audit-box severity (separate · informational only · not a tag axis)

Used **only inside `.audit-box` tables** to color a severity column. Not for tagging findings
(use the Status × Layer axes for that).

| Severity | CSS var | Color | WCAG |
|---|---|---|---|
| high | `--audit-severity-high` | terracotta `#A85F4D` | 4.8:1 |
| mid | `--audit-severity-mid` | gold-dark `#7E6720` | 5.5:1 |
| low | `--audit-severity-low` | sage `#5A8A5A` | 4.6:1 |

### Example markup

```html
<div class="r-item">
  <span class="r-tag layer-d">D 精简</span>
  <span class="change-tag">改</span>
  <span class="r-label">这段可压缩 1/3</span>
  <div class="r-compare">
    <div class="r-before"><span class="r-prefix">原</span>原文 60 词的版本...</div>
    <div class="r-after"><span class="r-prefix">改</span>压缩后 40 词的版本...</div>
  </div>
  <p class="r-body">理由：信息密度低 · 重复了 §2 的论点。</p>
</div>
```

---

## Profile B · Technical review

**Schema · 3 axes × 3 variants = 9 distinct colors**. Every finding carries up to 3 tags
(one per axis). The asymmetry — warm-status · cool/earth-layer · achromatic-severity — is
the visual signal that severity is **orthogonal** to the chromatic axes.

### Status axis · 3 values (what action · warm chromatic)

| Status | CSS | Color | WCAG | Meaning |
|---|---|---|---|---|
| **REV** revise | `.tech-tag.tech-status-rev` | blue-gray `#527590` | 4.6:1 white-on | change needed |
| **KEPT** approve | `.tech-tag.tech-status-kept` | gold-dark `#7E6720` | 5.5:1 white-on | no change · approved |
| **DEL** remove | `.tech-tag.tech-status-del` | terracotta `#A85F4D` | 4.8:1 white-on | delete entirely |

### Layer axis · 3 values (which layer the finding crosses · cool/earth chromatic)

| Layer | CSS | Color | WCAG | Meaning |
|---|---|---|---|---|
| **A** spec-internal | `.tech-tag.tech-layer-a` | forest green `#5A7A5A` | 4.7:1 white-on | finding inside one spec layer |
| **B** cross-layer | `.tech-tag.tech-layer-b` | plum `#7C5A7A` | 5.1:1 white-on | finding crosses layers (spec ↔ impl, etc.) |
| **C** style / wording | `.tech-tag.tech-layer-c` | slate teal `#4E7A85` | 4.8:1 white-on | non-semantic · wording · formatting |

### Severity axis · 3 values (priority · achromatic grayscale)

| Severity | CSS | Color | WCAG | Meaning |
|---|---|---|---|---|
| **P0** must | `.tech-tag.tech-sev-p0` | ink `#1A1A18` | 15.5:1 white-on | must address — factual error · invariant violated |
| **P1** should | `.tech-tag.tech-sev-p1` | mid `#555555` | 7.5:1 white-on | should address — ambiguity · trim candidate |
| **P2** note | `.tech-tag.tech-sev-p2` | light `#717171` | 4.6:1 white-on (floor) | note — style · redundancy · nice-to-have |

### Example markup

```html
<div class="r-item">
  <span class="tech-tag tech-status-rev">REV</span>
  <span class="tech-tag tech-layer-b">B</span>
  <span class="tech-tag tech-sev-p0">P0</span>
  <span class="r-label">spec says X · implementation does Y</span>
  <p class="r-body">Source · <code>spec.md §3.1</code> defines invariant
  "result is monotonic"; <code>impl.ts:142</code> sorts by hash, breaking monotonicity.
  Choose: relax the invariant or fix the impl.</p>
</div>
```

---

## Visual conventions (both profiles)

| Element | Style | Reason |
|---|---|---|
| Status / Layer / Severity tags | **filled** dark bg + white text · `font-mono` 10px · `letter-spacing: 0.06em` | high recognition · compact · DNA1 mono-label role |
| `.r-compare` before/after blocks | **outlined** light bg + dark border-left + ink text | readable for longer text |
| `.card-box` (mock UI preview cards) | outlined matching status color scheme | mirrors deployed visual |
| `.audit-box` (informational panels) | Cool Blue-Gray left accent · NOT a status color | information ≠ change |

---

## Picking a profile · decision rules

1. **Is the artifact prose (case study, blog, doc) or structured (spec, code, architecture)?**
   - Prose → Profile A
   - Structured → Profile B

2. **Do findings have a clear "must / should / note" priority?**
   - Yes → Profile B (severity axis maps directly)
   - No, every finding is "a candidate change" → Profile A (severity lives only in audit-box)

3. **Does the doc need a layer dimension at all?**
   - Doc is single-axis (just status) → omit layer · use only `.change-tag` or
     `.tech-tag.tech-status-*`
   - Doc benefits from layer (story / dedup / cross-layer / etc.) → use the layer axis

4. **Mixing profiles in one HTML is allowed if and only if** the two regions are visually
   separated (different `<section>` blocks · different legends · different `.section-label`).
   In practice this is rare — pick one.

---

## Why this is a BP extension, not a base spec rule

This 2-profile tag system is an **extension** of DNA1 (per `dna1-spec.md` §"Extension
governance" rule 5) — not part of the canonical §0 JSON tokens. It lives here because it's
**apply-time** guidance specific to the review-HTML surface. The base spec stays
surface-agnostic.

Implication: the `evidence-poet-auditor` does **not** enforce tag orthogonality (which would
have the auditor enforcing an extension instead of the spec). This skill enforces orthogonality
at create-time; a visual review pass catches post-edit drift.

---

## Adding tags · extension governance

If your review needs a tag the existing axes don't cover (e.g., a "blocked / awaiting input"
status, or a new layer dimension), it's an extension:

1. **Namespace it** — `--review-<dim>-*` or `--tech-<axis>-<variant>` (don't reuse base
   `--color-*` names)
2. **WCAG comment inline** — every new color carries `/* WCAG <ratio>:1 <text-color-on-this> */`
3. **Document the axis** — what's the semantic? Why does the existing axes not cover it?
4. **Don't break orthogonality** — if a new axis duplicates the function of an existing one
   (e.g., second "severity" axis), refuse and use the existing.

See `dna1-spec.md` §"Extension governance" rules 1–5 for the full discipline.
