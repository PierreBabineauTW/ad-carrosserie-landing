# AD Carrosserie — Ultra-High Converting Landing Page

100% free-stack (no paid APIs, no subscriptions) static landing page for AD Carrosserie built with pure HTML5/CSS3/Vanilla JS.

## Features
- Glassmorphic sticky navbar + mobile floating CTA bar (Call / WhatsApp)
- Hero with animated counters and dual CTAs
- Interactive SVG car damage selector with instant client-side estimate
- Franchise 0€ simulator + Loi Hamon rights accordion
- Before/After drag slider (3 categories)
- Courtesy vehicle fleet selector
- Simulated live repair progress tracker
- 4-step lead form with localStorage auto-save/recovery, WhatsApp fallback submission
- Google reviews carousel + AD network trust badges
- Emergency roadside assistance banner with geolocation-to-WhatsApp
- Local SEO footer with live open/closed status and map embed

## Stack
Pure static site — `index.html`, `style.css`, `script.js`. No build step, no dependencies, no server required. Deployable as-is on Vercel, GitHub Pages, Netlify, etc.

## Customize
- Replace phone numbers (`tel:` / `wa.me`) in `index.html` and `script.js` with the real shop numbers.
- Replace address, hours, and map embed coordinates in the footer.
- Swap Unsplash before/after placeholder images for real shop photography.
- Connect the multi-step form to a real free-tier endpoint (Formspree / Web3Forms / EmailJS) if email delivery is required in addition to the WhatsApp fallback.
