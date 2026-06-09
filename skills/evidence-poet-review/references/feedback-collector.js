/* ═══════════════════════════════════════════════════════════════════
 * Review HTML · Feedback collector · v1.0 · 2026-05-30
 *
 * The "Copy all feedback" button for review HTMLs that use per-section
 * .user-feedback blocks (feedback mechanism (b) per review_html_workflow.md
 * §"反馈在哪"). Self-contained vanilla JS · zero dependencies.
 *
 * WHY THIS EXISTS:
 *   A static review HTML's checkbox/textarea state never reaches the AI unless
 *   the page can serialize it. This button walks every .user-feedback block,
 *   reads the checked ratings + notes, and writes a plain-text digest to the
 *   clipboard so the user pastes it straight into the chat → AI continues the
 *   revision. The page itself saves NO data (no localStorage, no backend) —
 *   state is ephemeral DOM; copy before closing the tab.
 *
 * HOW TO USE:
 *   Add right before </body> in any review HTML:
 *     <script src="<relative-path>/visual_review_html/feedback-collector.js"></script>
 *   OR (for a fully self-contained single file) inline the IIFE below into a
 *   <script> block at the end of <body>.
 *
 * MARKUP CONTRACT (what it reads):
 *   - Each feedback block:   <div class="user-feedback"> ... </div>
 *       · ratings:  <input type="checkbox"> inside a <label> whose text is the
 *                   rating (e.g. "✓ approve" / "⚠ revise" / "✗ reject")
 *       · notes:    a single <textarea>
 *   - Section label: nearest enclosing section heading. Works for both layout
 *     archetypes — A (.section-pair + .section-label / h2.section-title) and
 *     B (.section + .section-head h2). Falls back to the .fb-label text.
 *
 * COLORS are DNA1 canonical hex inline (ink #1A1A18 · gold #C8A84B · paper
 * #F8F7F3 · sage #5A7A5A · terracotta #A85F4D) — kept literal so the script is
 * self-contained and works even when pasted into a CSS-less context.
 * ═══════════════════════════════════════════════════════════════════ */
(function () {
  const btn = document.createElement('button');
  btn.textContent = '📋 Copy all feedback';
  btn.style.cssText = `
    position: fixed; top: 16px; right: 24px; z-index: 1000;
    font-family: 'DM Mono', 'Microsoft YaHei', monospace; font-size: 12px;
    padding: 10px 18px; background: #1A1A18; color: #F8F7F3;
    border: 2px solid #C8A84B; border-radius: 0; cursor: pointer;
    letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;
    box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  `;
  btn.addEventListener('mouseenter', () => { btn.style.background = '#C8A84B'; btn.style.color = '#1A1A18'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#1A1A18'; btn.style.color = '#F8F7F3'; });
  document.body.appendChild(btn);

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 72px; right: 24px; z-index: 1001;
    font-family: 'DM Mono', 'Microsoft YaHei', monospace; font-size: 11px;
    padding: 8px 14px; background: #5A7A5A; color: #fff;
    border-radius: 0; opacity: 0; transition: opacity 0.3s;
    pointer-events: none; letter-spacing: 0.04em; text-transform: uppercase;
  `;
  document.body.appendChild(toast);

  function showToast(msg, ok) {
    toast.textContent = msg;
    toast.style.background = ok ? '#5A7A5A' : '#A85F4D';
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, ok ? 2500 : 4000);
  }

  // Find the nearest section label for a feedback block · archetype-agnostic.
  function sectionLabelFor(fb) {
    const section = fb.closest('.section, .section-pair, section');
    if (section) {
      const head = section.querySelector('.section-head h2, h2.section-title, .section-label, h2, h3');
      if (head) {
        const clone = head.cloneNode(true);
        clone.querySelectorAll('.line-ref, .en-ref, .tags').forEach(el => el.remove());
        const t = clone.textContent.trim().replace(/\s+/g, ' ');
        if (t) return t;
      }
    }
    // Fallback: the block's own .fb-label (e.g. "USER FEEDBACK · §3")
    const lbl = fb.querySelector('.fb-label');
    return lbl ? lbl.textContent.trim().replace(/\s+/g, ' ') : '?';
  }

  btn.addEventListener('click', () => {
    const lines = [];
    lines.push(`=== ${document.title} ===`);
    lines.push(`Date: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`);
    lines.push('');

    const counts = { approve: 0, revise: 0, reject: 0, other: 0, unset: 0, withNotes: 0 };
    let total = 0;

    document.querySelectorAll('.user-feedback').forEach(fb => {
      total++;
      const secLabel = sectionLabelFor(fb);

      const checked = Array.from(fb.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => (cb.parentElement.textContent || '').trim().replace(/^\s*\[\s*x?\s*\]\s*/i, ''));
      const notes = (fb.querySelector('textarea')?.value || '').trim();

      if (checked.length === 0 && !notes) {
        lines.push(`${secLabel}  · (no input)`);
        counts.unset++;
      } else {
        if (checked.length === 0) {
          lines.push(`${secLabel}  · (no rating · notes only)`);
        } else {
          lines.push(`${secLabel}  · ${checked.join(' · ')}`);
          for (const c of checked) {
            if (/✓|approve/i.test(c)) counts.approve++;
            else if (/⚠|revise/i.test(c)) counts.revise++;
            else if (/✗|reject/i.test(c)) counts.reject++;
            else counts.other++;
          }
        }
        if (notes) {
          lines.push(`   notes: ${notes.split('\n').join(' / ')}`);
          counts.withNotes++;
        }
      }
      lines.push('');
    });

    lines.push('=== Summary ===');
    lines.push(`Sections: ${total} total · ${counts.unset} unset`);
    lines.push(`Ratings: ✓ ${counts.approve} approve · ⚠ ${counts.revise} revise · ✗ ${counts.reject} reject · ${counts.other} other`);
    lines.push(`Notes filled: ${counts.withNotes}`);

    const text = lines.join('\n');

    if (!navigator.clipboard) {
      showToast('✗ Clipboard API unavailable · select + copy below', false);
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:120px;right:24px;width:400px;height:300px;z-index:1002;';
      document.body.appendChild(ta);
      ta.select();
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => showToast('✓ Copied · paste to chat', true))
      .catch(err => showToast('✗ Copy failed · ' + err.message, false));
  });
})();
