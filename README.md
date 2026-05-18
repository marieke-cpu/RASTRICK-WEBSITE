# RASTRICK. MADE — Teaser Landing Page

Pre-launch teaser for the RASTRICK. MADE studio site. Three files: `teaser.html`, `teaser.css`, `teaser.js`. No build step. Deploy as-is.

---

## Setup

### 1. Web3Forms access key

The form already uses the existing RASTRICK. MADE key. If you need a separate key for the teaser (recommended so submissions are labelled clearly), get one at [web3forms.com](https://web3forms.com) — it's free. Replace both instances in `teaser.html`:

```html
<input type="hidden" name="access_key" value="YOUR_KEY_HERE">
```

There are two forms — one in section `#s03` and one in `#s07`. Update both.

### 2. Calendly URL

In `teaser.js`, line 8:

```js
const CALENDLY_URL = 'https://calendly.com/hello-rastrick';
```

Replace with your specific event type URL if you want to send teaser visitors to a different booking type.

### 3. Launch date

In `teaser.js`, line 11:

```js
const LAUNCH_DATE = new Date('2026-05-22T10:00:00+10:00');
```

Format: ISO 8601 with timezone offset. `+10:00` = AEST. When this date passes, the countdown block is replaced with `> SYSTEM_LIVE. ACCESS_NOW.` and a link to the full site. Update the link target in `teaser.html` section `#cd-live`.

---

## Fonts

Currently loaded via Google Fonts CDN (Anton + JetBrains Mono). For production, self-host them to avoid render-blocking and remove the Google dependency.

**Download Anton:**
- Google Fonts: [fonts.google.com/specimen/Anton](https://fonts.google.com/specimen/Anton)
- Download the TTF, convert to WOFF2 with [Squoosh](https://squoosh.app) or [FontSquirrel](https://www.fontsquirrel.com/tools/webfont-generator)

**Download JetBrains Mono:**
- GitHub: [github.com/JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono/releases) (download the zip, grab the WOFF2 files)

Put font files in `/fonts/` and replace the `<link>` tags in `teaser.html` with:

```html
<style>
  @font-face {
    font-family: 'Anton';
    src: url('/fonts/Anton-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'JetBrains Mono';
    src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'JetBrains Mono';
    src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
</style>
```

Remove the two Google Fonts `<link>` tags and the two `<link rel="preconnect">` tags.

---

## Deployment

Static files — deploy anywhere:

- **Netlify:** drag the folder into [app.netlify.com](https://app.netlify.com/drop) or push to GitHub and connect the repo
- **Vercel:** `vercel --prod` from the project root
- **Cloudflare Pages:** connect your repo, build command = none, output dir = `/`

If you want `teaser.html` to be the root page, rename it to `index.html` (and rename the current `index.html` to `site.html` or similar to preserve it).

---

## Easter egg

Type `RASTRICK` on any desktop keyboard to trigger the cheat code screen.

---

## Accessibility notes

- Boot sequence is fully skipped when `prefers-reduced-motion` is enabled
- Boot screen is skipped on revisit within the same browser session
- All decorative elements are `aria-hidden`
- Form messages use `aria-live` and `role="status"`
- Tap targets are minimum 44×44px
