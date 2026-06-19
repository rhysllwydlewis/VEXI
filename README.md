# VEXI

Production landing page for [vexi.co.uk](https://vexi.co.uk) — the technology group behind a growing portfolio of digital platforms, starting with [Event Flow](https://event-flow.co.uk) and [Chlo](https://chlo.co.uk).

## Project Status

| Area | Status |
|------|--------|
| Landing page (hero, about, portfolio sections) | ✅ Complete |
| Navbar blur / scroll effects | ✅ Complete |
| Contact modal with client-side validation | ✅ Complete |
| `/api/contact` with rate limiting, honeypot & ALTCHA | ✅ Complete |
| Privacy Policy page (`/privacy`) | ✅ Complete |
| Terms of Use page (`/terms`) | ✅ Complete |
| Legal Hub page (`/legal`) | ✅ Complete |
| Portfolio — Event Flow card (live link) | ✅ Complete |
| Portfolio — Chlo card (live link) | ✅ Complete |
| Email delivery integration | ✅ Postmark integrated (env-gated; falls back to console log when unconfigured) |
| Space-background hero | ✅ Complete |
| SEO — robots.txt + sitemap.xml | ✅ Complete |
| Social preview image (OG / Twitter card) | ✅ Complete |

## About

Vexi is a tech-forward parent company powering purpose-built digital platforms. The landing page features a clean space-background hero with animated stars, shooting stars, subtle aurora haze, animated background blobs, glassmorphism cards, scroll-triggered animations, and an animated contact modal.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15.5** | App Router, TypeScript, SSR/SSG |
| **React 19** | UI library |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Page animations, scroll triggers, modal transitions |
| **TypeScript** | Type-safe code throughout — no `any` types |
| **Inter** | Via `@fontsource/inter` (self-hosted, no external network dependency at build time) |
| **ALTCHA** | Privacy-focused proof-of-work contact form spam protection |
| **Postmark** | Transactional email for contact form submissions |

## File Structure

```
vexi/
├── app/
│   ├── layout.tsx              # Root layout: Inter font, metadata, OG tags
│   ├── page.tsx                # Main page composing all sections (server component)
│   ├── globals.css             # Tailwind directives + custom keyframes
│   ├── robots.ts               # robots.txt (Next.js App Router)
│   ├── sitemap.ts              # sitemap.xml (Next.js App Router)
│   ├── legal/
│   │   └── page.tsx            # Legal Hub page (/legal)
│   ├── privacy/
│   │   └── page.tsx            # Privacy Policy page (/privacy)
│   ├── terms/
│   │   └── page.tsx            # Terms of Use (/terms)
│   └── api/
│       ├── altcha/
│       │   └── challenge/
│       │       └── route.ts    # GET API: ALTCHA challenge generation
│       └── contact/
│           └── route.ts        # POST API: rate limiting, honeypot, ALTCHA, Postmark delivery
├── components/
│   ├── Navbar.tsx              # Fixed transparent navbar with scroll blur
│   ├── Hero.tsx                # Full-viewport space hero section
│   ├── AnimatedBlobs.tsx       # CSS animated background gradient shapes
│   ├── StarfieldCanvas.tsx     # Canvas starfield with shooting stars & nebula
│   ├── About.tsx               # About section with 3 glassmorphism cards
│   ├── Portfolio.tsx           # Brand showcase grid
│   ├── Footer.tsx              # Minimal dark footer
│   ├── LegalNav.tsx            # Navigation bar for legal pages
│   └── ContactWidget.tsx       # Modal overlay contact form + React context
├── lib/
│   └── nasa-svs.ts             # NASA SVS API client + helpers, retained for optional future use
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── vexi_hero_preview.jpg   # OG / Twitter social preview image
├── tailwind.config.ts          # Extended theme with custom colors & animations
├── next.config.js              # Next.js config (security headers, image remotePatterns)
├── .eslintrc.json              # ESLint (Next.js strict preset)
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Production

```bash
# Type-check, lint and build for production
npm run build

# Start production server
npm start
```

## Linting

```bash
npm run lint
```

## Deployment (Railway)

Railway auto-detects Next.js projects. No `Dockerfile` required.

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Port:** `3000` (Next.js default)

Push to your Railway-linked branch and it deploys automatically.

### Environment Variables

Copy `.env.example` to `.env.local` (git-ignored) and fill in your values.

| Variable | Required | Description |
|----------|----------|-------------|
| `ALTCHA_HMAC_KEY` | For contact form spam protection | The shared ALTCHA HMAC secret. Copy the existing value from EventFlow Railway into VEXI Railway, or generate a new one with `openssl rand -base64 32`. |
| `POSTMARK_API_TOKEN` | For email | Postmark **Server API Token** (from your Postmark server's API Tokens tab). |
| `CONTACT_EMAIL_TO` | For email | The inbox address where contact submissions are delivered. |
| `CONTACT_EMAIL_FROM` | For email | The verified **Sender Signature** address in Postmark (must be verified in your Postmark account). |

`ALTCHA_HMAC_KEY` is required in production. Without it, the contact endpoint blocks submissions rather than accepting unverified messages.

All three Postmark variables must be set together. When any is missing the contact endpoint safely falls back to logging submissions to stdout.

#### Setting up ALTCHA

1. In Railway, open the EventFlow project and copy the existing `ALTCHA_HMAC_KEY` value.
2. In Railway, open the VEXI project and add the same variable name and value.
3. Redeploy VEXI.

You can also generate a separate VEXI key with:

```bash
openssl rand -base64 32
```

#### Setting up Postmark (step-by-step)

1. **Create a Postmark account** at [postmarkapp.com](https://postmarkapp.com).
2. **Create a Server** (e.g. "VEXI Production") in the Postmark dashboard.
3. **Copy the Server API Token** from *API Tokens* tab → set as `POSTMARK_API_TOKEN`.
4. **Add a Sender Signature** (*Sender Signatures* tab) for the address you want to send from (e.g. `noreply@vexi.co.uk`). Verify the DNS record or email challenge. Set as `CONTACT_EMAIL_FROM`.
5. **Set `CONTACT_EMAIL_TO`** to the inbox where you want to receive contact form emails (e.g. `hello@vexi.co.uk`).
6. In Railway: add all three vars under *Project → Variables*. Redeploy.

The submitted form's email address becomes the `Reply-To` header so you can reply directly from your inbox.

## Features

- ✅ Animated floating background blobs (CSS keyframes)
- ✅ Animated starfield canvas (twinkling stars, nebula haze, shooting stars, no hydration mismatch)
- ✅ Clean space-only hero with no object renderer layer
- ✅ Glassmorphism cards with hover effects
- ✅ Scroll-triggered animations (Framer Motion `whileInView`)
- ✅ Staggered hero text reveal
- ✅ Navbar blur on scroll (smooth border transition, no flicker)
- ✅ Contact modal (backdrop blur, spring animation, Escape/backdrop to close)
- ✅ Client-side form validation with inline error messages and ARIA accessibility
- ✅ `/api/contact` POST endpoint with rate limiting (5 req / 15 min per IP), honeypot anti-spam, **ALTCHA verification**, and **Postmark email delivery** (env-gated)
- ✅ Success state with auto-close after 2.5 s
- ✅ Portfolio: Event Flow (live link) + Chlo (live link)
- ✅ Privacy Policy page (`/privacy`) — UK GDPR–aligned
- ✅ Terms of Use page (`/terms`) — English law
- ✅ Legal Hub page (`/legal`)
- ✅ robots.txt + sitemap.xml (Next.js App Router)
- ✅ Open Graph + Twitter Card social preview image
- ✅ Fully responsive — mobile, tablet, desktop
- ✅ No `any` types — fully typed TypeScript

## License

© 2026 Vexi Ltd. All rights reserved.
