# Review Roles · Layer 0 baseline + Layer 1+ role-specific lenses

A review is **not** a single viewpoint — it's a stack. **Layer 0 is always on** (universal
proofreader checks). **Layer 1+ are role-specific lenses** added per artifact type. Every
finding from any layer uses the same severity scale (P0 / P1 / P2 · see `tag-profiles.md`).

---

## Layer 0 · baseline editorial consistency · always on

Universal proofreader checks. Run for **every** review regardless of artifact type, regardless
of which role(s) you stack on top. These are the dimensions Layer 1+ roles often miss because
they're focused elsewhere.

| Dimension | What to flag | Typical severity |
|---|---|---|
| **Dead references** | cross-ref points to a file / section / anchor that doesn't exist | P0 |
| **Frontmatter ↔ body drift** | Version field says v0.2 but body still talks v0.1 · Status says draft but content says shipped | P0 |
| **Number / date / count drift** | same number appears in two sections with different values · date changed in §1 but not §3 | P0–P1 |
| **Internal repetition** | same point / number / quote appears in multiple sections | P1–P2 |
| **Format drift** | inconsistent capitalization · heading hierarchy break · code-fence language drift | P2 |
| **Typo / grammar** | obvious typos · agreement errors | P2 |
| **Anchor / link drift** | markdown link text doesn't match destination · anchor case mismatch | P1 |

Don't write a separate "Layer 0" section in your annotations — these findings interleave
with Layer 1+ findings, just tagged with their own severity. Convention: Layer 0 findings
rarely get a `.r-tag.layer-*` (Profile A) or `.tech-tag.tech-layer-*` (Profile B); they're
naked status + severity.

---

## Layer 1+ · role-specific lenses · pick per artifact

Each lens is a *role* you ask the AI to inhabit. Roles stack — a long technical review often
runs two or three in parallel. The role tells the AI *what to look for that Layer 0 won't see*.

### Generic roles (start here · adapt to your domain)

| Role | What it sees | Typical severity bias | Pair with profile |
|---|---|---|---|
| **First-time reader · cold scan** | hook strength · is the lede a problem the reader recognizes · does scanning the headings convey the arc | P1 mostly | A · editorial |
| **Operational executor** | can a new reader actually *use* this? · are triggers / decision trees / examples actionable, or hand-wavy? | P0–P1 | both |
| **Catalog / consistency auditor** | does this artifact reconcile with the broader catalog · cross-doc consistency · is the canonical-source registry honored | P0–P1 | both |
| **Spec-rootedness auditor** | is every rule rooted in the spec? · or is the artifact inventing rules the spec doesn't authorize | P0 | B · technical |
| **Cross-layer-symmetry checker** | does spec teach X · impl apply X · auditor verify X · are the three aligned | P0–P1 | B · technical |
| **Enforceability assessor** | does each rule have clear violation criteria · can it be mechanically checked, or only judged? | P1 | B · technical |
| **Detail-accuracy reviewer** | hex / spacing / font-name / regex / line-number values · are they actually correct vs the source? | P0 (when wrong) | both |
| **Privacy / sanitization auditor** | for public-facing artifacts derived from internal sources · are internal references / proper nouns / sensitive details removed | P0 (any violation) | A · editorial |
| **Body ↔ caption layering checker** | (for image-rich artifacts) does body carry concept · caption carry concrete · or do they duplicate? | P1 | A · editorial |
| **Hedge / softening detector** | over-hedged claims · "could potentially" · stake-in-the-ground claims softened to wishlists | P1 | A · editorial |

### Picking roles per artifact type

| Artifact type | Layer 0 | Layer 1+ default roles |
|---|---|---|
| **Case study · portfolio** | ✓ | cold-scan reader + body↔caption checker + hedge detector |
| **Blog / public-facing post** | ✓ | cold-scan reader + privacy auditor + hedge detector |
| **Internal doc / proposal** | ✓ | operational executor + catalog auditor |
| **Spec / standard** | ✓ | enforceability assessor + cross-layer-symmetry + detail-accuracy |
| **Code / architecture** | ✓ | spec-rootedness + detail-accuracy + cross-layer-symmetry |
| **Best-practice / playbook** | ✓ | operational executor + catalog auditor + enforceability |

These are defaults — drop or swap based on the actual artifact. If two roles will produce
near-identical findings, run one.

---

## Adding a new role / profile

When your review needs a lens not in the table above:

1. **Name the role** — short noun phrase ("compliance-with-X auditor", "newbie-onboarding
   reader"). Specific beats generic.
2. **Define what it sees that Layer 0 doesn't** — one sentence. If you can't, the role
   collapses into Layer 0.
3. **Document the severity bias** — does this lens mostly find P0s (hard violations) or
   P1s (judgment calls)? Mostly-P2 lenses are usually too weak to be worth running.
4. **Pair with the tag profile** — editorial / technical / both. If "both", the role's
   typical findings should be expressible in either profile's tag axes.
5. **Pick a trigger** — when should this role fire? Tied to artifact type? To a content
   flag? Document it.

The pattern is intentionally lightweight — adding a role is a markdown-only change, no CSS,
no new tag tokens, no auditor profile work.

---

## How roles show up in the annotations

A role doesn't get its own visual tag (no `.r-tag.role-*` — that would multiply axes
endlessly). Instead, the **role context lives in the `r-label`** or in a meta-bar at the top
of the review HTML:

```
USER MODE: cold-scan reader + privacy auditor

§3 · Hook
  [P1] cold-scan: opens with "I worked on X" — not what reader is looking for · candidate hook
  [P0] privacy: mentions client name "Foo Corp" — public-facing artifact · MUST sanitize
```

The reader knows from the meta-bar which lenses are on; per-finding, the `r-label` text
makes the lens explicit when needed.

---

## System-level findings · surface, don't fix

Sometimes a review surfaces a pattern that isn't an artifact-local problem — it's a
**system-level** issue (a class of failure the catalog will repeat). Examples:

- "BP frontmatter ↔ matrix drift has no auto-check — this artifact happened to expose it"
- "Related-BPs links are dead in 3 of the 5 BPs sampled — the catalog needs a link-validity
  audit"

For these:

- **Add a "System-level findings" block** at the bottom of the review HTML (before the
  final meta-bar) — list the finding, why no auto-check catches it, candidate fix
- **Don't fix it inline** — the review is a propose layer · the catalog change is a separate
  decision

This keeps the review focused on the artifact in front of you, while still surfacing the
pattern for the user to act on.
