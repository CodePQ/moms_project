# Site Inspection Board

Working board from the site audit on 2026-08-02. Updated 2026-08-02 after the first full pass — most items moved to Done. Move new cards to **In Progress** / **Done** as we work through them.

---

## Backlog

- [ ] **Nav + inline styles are duplicated across every page** with no shared template/include. Deferred deliberately: de-duplicating would require either a build step (disallowed per CLAUDE.md without approval) or a JS-fetch include (breaks the zero-JS-fallback requirement). Flag if this keeps causing drift bugs — worth revisiting as a real decision, not a silent fix.
- [ ] No purpose-built 1200×630 Open Graph share image exists yet — OG tags currently point at existing square assets (`hero-bg.png`, `book-cover.png`, etc.), which will get center-cropped by Facebook/Twitter. Consider commissioning a proper wide share image.

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
