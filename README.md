# VEXI

Production landing page for [vexi.co.uk](https://vexi.co.uk) — the technology group behind a growing portfolio of digital platforms, starting with [Event Flow](https://event-flow.co.uk) and [Chlo](https://chlo.co.uk).

## Project Status

| Area | Status |
|------|--------|
| Landing page (hero, about, portfolio sections) | ✅ Complete |
| Navbar blur / scroll effects | ✅ Complete |
| Contact modal with client-side validation | ✅ Complete |
| `/api/contact` with rate limiting & honeypot | ✅ Complete |
| Privacy Policy page (`/privacy`) | ✅ Complete |
| Terms of Use page (`/terms`) | ✅ Complete |
| Legal Hub page (`/legal`) | ✅ Complete |
| Portfolio — Event Flow card (live link) | ✅ Complete |
| Portfolio — Chlo card (live link) | ✅ Complete |
| Email delivery integration | ✅ Postmark integrated (env-gated; falls back to console log when unconfigured) |
| 3D photorealistic moon (WebGL + NASA LROC textures) | ✅ Complete |
| SEO — robots.txt + sitemap.xml | ✅ Complete |
| Social preview image (OG / Twitter card) | ✅ Complete |

## About

Vexi is a tech-forward parent company powering purpose-built digital platforms. The landing page features a photorealistic 3D moon (WebGL), animated star field with shooting stars, animated background blobs, glassmorphism cards, scroll-triggered animations, and an animated contact modal.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | App Router, TypeScript, SSR/SSG |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Page animations, scroll triggers, modal transitions |
| **Three.js + @react-three/fiber** | WebGL 3D moon sphere |
| **@react-three/drei** | Three.js React helpers |
| **TypeScript** | Type-safe code throughout — no `any` types |
| **Inter** | Via `@fontsource/inter` (self-hosted, no external network dependency at build time) |
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
│   │   └── page.tsx            # Terms of Use page (/terms)
│   └── api/
│       └── contact/
│           └── route.ts        # POST API: rate limiting, honeypot, Postmark delivery
├── components/
│   ├── Navbar.tsx              # Fixed transparent navbar with scroll blur
│   ├── Hero.tsx                # Full-viewport hero section
│   ├── AnimatedBlobs.tsx       # CSS animated background gradient shapes
│   ├── StarfieldCanvas.tsx     # Canvas starfield with shooting stars & nebula
│   ├── MoonSphere.tsx          # 3D WebGL moon (Three.js, NASA LROC textures)
│   ├── MoonPlaceholder.tsx     # CSS fallback shown while MoonSphere loads
│   ├── About.tsx               # About section with 3 glassmorphism cards
│   ├── Portfolio.tsx           # Brand showcase grid
│   ├── Footer.tsx              # Minimal dark footer
│   ├── LegalNav.tsx            # Navigation bar for legal pages
│   └── ContactWidget.tsx       # Modal overlay contact form + React context
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── vexi_hero_preview.jpg   # OG / Twitter social preview image
│   └── textures/moon/
│       ├── moon_color.jpg      # NASA LROC WAC albedo map (1024×512)
│       └── moon_normal.jpg     # Tangent-space normal map (512×256)
├── tailwind.config.ts          # Extended theme with custom colors & animations
├── next.config.js              # Next.js config (security headers, webpack R3F fix)
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
| `POSTMARK_API_TOKEN` | For email | Postmark **Server API Token** (from your Postmark server's API Tokens tab). |
| `CONTACT_EMAIL_TO` | For email | The inbox address where contact submissions are delivered. |
| `CONTACT_EMAIL_FROM` | For email | The verified **Sender Signature** address in Postmark (must be verified in your Postmark account). |

All three Postmark variables must be set together. When any is missing the contact endpoint safely falls back to logging submissions to stdout.

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
- ✅ 3D photorealistic moon sphere (WebGL via Three.js + @react-three/fiber, NASA LROC textures, parallax scroll)
- ✅ Glassmorphism cards with hover effects
- ✅ Scroll-triggered animations (Framer Motion `whileInView`)
- ✅ Staggered hero text reveal
- ✅ Navbar blur on scroll (smooth border transition, no flicker)
- ✅ Contact modal (backdrop blur, spring animation, Escape/backdrop to close)
- ✅ Client-side form validation with inline error messages and ARIA accessibility
- ✅ `/api/contact` POST endpoint with rate limiting (5 req / 15 min per IP), honeypot anti-spam, and **Postmark email delivery** (env-gated)
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
