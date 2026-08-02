# Site Inspection Board

Working board from the site audit on 2026-08-02. Updated 2026-08-02 after the first full pass — most items moved to Done. Move new cards to **In Progress** / **Done** as we work through them.

---

## Backlog

- [ ] **Mobile version needs a real pass** — the hamburger nav works functionally, but overall mobile layout/spacing/typography across pages hasn't been tuned. (Flagged 2026-08-02, deferred per user request.)
- [ ] **Nav + inline styles are duplicated across every page** with no shared template/include. Deferred deliberately: de-duplicating would require either a build step (disallowed per CLAUDE.md without approval) or a JS-fetch include (breaks the zero-JS-fallback requirement). Flag if this keeps causing drift bugs — worth revisiting as a real decision, not a silent fix.
- [ ] No purpose-built 1200×630 Open Graph share image exists yet — OG tags currently point at existing square assets (`hero-bg.png`, `book-cover.png`, etc.), which will get center-cropped by Facebook/Twitter. Consider commissioning a proper wide share image.

---

## 🎨 Redesign Backlog (page-by-page, 2026-08-02)

Component/visual remodel candidates found on this pass. Nothing below has been implemented — this is scoping only, pending your direction. Open questions are called out inline and were asked separately.

### Sitewide / cross-cutting
- [x] ~~**Registration modal (circle.html) reads as an unstyled placeholder**~~ → **Done 2026-08-02:** added a heading ("Let's Reserve Your Place"), warm first-person subtitle, labeled fields, focus states on inputs, a circular brand-icon accent, backdrop blur + rise-in animation, and a privacy trust line with lock icon linking to privacy.html. Scoped to `.modal-dialog` only so connect.html's contact form is untouched (still backlogged separately). Also fixed a pre-existing a11y bug: `aria-labelledby="register-modal-title"` pointed at an id that didn't exist — now it does.
- [ ] **Contact form (connect.html) has the same underlying issue**, softened only by its card wrapper/heading — the input styling itself (`.newsletter-input`) is generic across every form on the site and should be redesigned once, then reused.
- [ ] **All form inputs rely on placeholder text only, no persistent `<label>`** — an accessibility gap (label vanishes once typing starts) as well as a polish gap (no floating/visible labels, no defined focus-state styling).
- [ ] **Every content page funnels into the same 3-card grid module** (`.journey-grid`/`.journey-card`) — consistent, but borders on the "cookie-cutter card grid" your own CLAUDE.md says to avoid unless justified.
- [ ] **Stripe's embedded buy-button (registration.html) is an unstyled 3rd-party widget** dropped into an otherwise fully custom design — the biggest brand mismatch on the site. Live/revenue integration — needs explicit sign-off before touching. **Decided:** explore Stripe Dashboard's Buy Button theming/branding options next phase.
- [ ] Footer is identical and minimal on every page (copyright + 2 legal links) — no social links, no secondary nav. Facebook links currently only live on community.html. **Decided:** add social links to the sitewide footer.

### index.html
- [ ] "About Lorraine Paquette" section is pure text, no portrait/imagery. **Decided: revisit later** — not scoped for this phase.
- [ ] "Body of Work" section is 7 stacked centered paragraphs with near-identical styling — could use more visual rhythm (pull-quote treatment, a section break, asymmetry).
- [ ] Closing section has 3 CTA buttons of equal visual weight — competing calls-to-action; consider a clear primary vs. secondary hierarchy.
- [ ] Footer's "newsletter-box" is a single link-button, not an actual email capture, despite the name and despite `.newsletter-input` existing unused in styles.css — naming/functionality mismatch.

### book.html
- [ ] Long single-column italic serif reading block (~15 paragraphs), only one visual break (the mid-page CTA card). Likely intentional editorial pacing — flagging in case it reads as too long/uniform on first visit.

### bridge.html
- [ ] Two placeholder cards, one-line descriptions — least-finished page on the site. On hold per the "noindex, keep unlinked" decision; revisit only if real partner-resource content gets planned.

### circle.html
- [ ] The registration modal (flagship item, above).
- [ ] Page is ~7 near-identical `h2 + paragraph` sections stacked before reaching the well-designed "Circle Details" card — visual rhythm is monotonous relative to how polished the Details card and homepage are. Some phrasing echoes across sections ("Not loudly. Not all at once." / "Not quickly. Not dramatically. But quietly.") — may be intentional literary repetition or may be worth consolidating. **Decided: revisit later** — not scoped for this phase.

### community.html
- [ ] Clean and functional; could add a Facebook icon/brand mark to each card for quicker recognition — minor polish, not urgent.

### connect.html
- [ ] Contact form styling (see sitewide notes).

### disclaimer.html / privacy.html
- [ ] No remodel needed — plain legal text is appropriate here.

### gallery.html
- [ ] Already one of the more polished pages (hover states, lightbox). Each image has only a single-word alt/title ("Buried," "Heard," etc.) with no accompanying reflection line — could add a short caption per image.

### pathway.html
- [ ] Two phase-cards ("Return To You" → "Becoming") have no visual connector/progression indicator between them — reads as two separate boxes rather than a sequential journey.

### reader-portal.html
- [ ] Clean and simple; no changes identified.

### registration.html
- [ ] Stripe buy-button visual mismatch (see sitewide notes).

## Needs a future decision (not blocking)
- [x] ~~`bridge.html` orphaned~~ → **Decided:** kept unlinked, added `noindex, nofollow`. Still placeholder content — revisit if/when there's real partner-resource copy to put there.
- [x] ~~`gallery.html` not in main nav~~ → **Decided:** added to main nav on all pages.

---

## Done

- [x] **Registration page had a stale event date** — [registration.html](registration.html) now says "Tuesday, August 18" to match [circle.html](circle.html)'s current gathering.
- [x] **Malformed HTML: orphan `<li>` outside `</html>`** — removed from registration.html.
- [x] **No mobile navigation menu** — added a pure-CSS (checkbox-hack) hamburger menu to all 12 pages; works with zero JS, matches CLAUDE.md's progressive-enhancement requirement.
- [x] **Accent color failed WCAG AA** — `--color-seascape-blue` darkened from `#8DA9C4` to `#4A6B85` in [css/styles.css](css/styles.css); now passes 4.5:1+ against both white and linen backgrounds in all uses (buttons, links, headings).
- [x] **Undefined CSS variables** — `--color-warm-stone`, `--color-warm-sand`, `--color-ink`, `--color-muted-slate` now properly declared in `:root`, each verified for AA contrast against the backgrounds they're used on.
- [x] **Gallery download icons missing `aria-label`** — added per-image labels in gallery.html.
- [x] **No meta descriptions / Open Graph tags** — added unique `<meta name="description">`, canonical link, and OG/Twitter-card tags to all 12 pages (legal/transactional pages got description + canonical only).
- [x] **No `robots.txt` / `sitemap.xml`** — both created at project root, pointing at `lorrainepaquette.com`; bridge.html and registration.html excluded from indexing.
- [x] **No `width`/`height` on content `<img>`** — added intrinsic dimensions to hero, book cover, and all 5 gallery images to prevent layout shift.
- [x] **README.md was stale** — project structure section now matches actual files (removed phantom `becoming.html`, added gallery/registration/disclaimer/supabase).
- [x] **No `rel="preconnect"` for Google Fonts** — added to all 12 pages.
- [x] **`index.html` had a page-specific `<style>` block in `<head>`** — moved `.bio-section p` rules into styles.css.
- [x] **Bonus fix:** `pathway.html` still had `<title>Becoming | The Quiet Return</title>` left over from a file rename — corrected to "The Pathway."

---

### Notes
- Stripe (registration.html) and the Supabase contact/registration functions were **not touched** beyond surrounding text/meta — button IDs, publishable keys, and function URLs are untouched.
- Still recommend a manual visual pass (see chat) on mobile Safari/Chrome for the new hamburger menu, and a spot-check of the new accent blue against the live design intent.
