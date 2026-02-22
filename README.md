# Vexi

Production landing page for [vexi.co.uk](https://vexi.co.uk) — the technology group behind a growing portfolio of digital platforms, starting with [Event Flow](https://event-flow.co.uk).

## About

Vexi is a tech-forward parent company powering purpose-built digital platforms. The landing page features animated background blobs, a floating particle field, glassmorphism cards, scroll-triggered animations, and an animated contact modal.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | App Router, TypeScript, SSR/SSG |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Page animations, scroll triggers, modal transitions |
| **TypeScript** | Type-safe code throughout — no `any` types |
| **Inter** | Via `@fontsource/inter` (self-hosted, no external network dependency at build time) |

## File Structure

```
vexi/
├── app/
│   ├── layout.tsx              # Root layout: Inter font, metadata, OG tags
│   ├── page.tsx                # Main page composing all sections
│   ├── globals.css             # Tailwind directives + custom keyframes
│   └── api/
│       └── contact/
│           └── route.ts        # POST API endpoint for contact form
├── components/
│   ├── Navbar.tsx              # Fixed transparent navbar with scroll blur
│   ├── Hero.tsx                # Full-viewport hero section
│   ├── AnimatedBlobs.tsx       # CSS animated background gradient shapes
│   ├── ParticleField.tsx       # Floating dot/particle effect (client-only)
│   ├── About.tsx               # About section with 3 glassmorphism cards
│   ├── Portfolio.tsx           # Brand showcase grid
│   ├── Footer.tsx              # Minimal dark footer
│   └── ContactWidget.tsx       # Modal overlay contact form + React context
├── public/
│   └── favicon.ico
├── tailwind.config.ts          # Extended theme with custom colors & animations
├── next.config.js              # Next.js config
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

Railway auto-detects Next.js projects. No `Dockerfile` or environment variables required.

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Port:** `3000` (Next.js default)

Push to your Railway-linked branch and it deploys automatically.

## Features

- ✅ Animated floating background blobs (CSS keyframes)
- ✅ Floating particle field (client-side, 40 particles, no hydration mismatch)
- ✅ Glassmorphism cards with hover effects
- ✅ Scroll-triggered animations (Framer Motion `whileInView`)
- ✅ Staggered hero text reveal
- ✅ Navbar blur on scroll
- ✅ Contact modal (backdrop blur, spring animation, Escape/backdrop to close)
- ✅ Client-side form validation with inline error messages
- ✅ `/api/contact` POST endpoint
- ✅ Success state with auto-close after 2.5 s
- ✅ Portfolio: Event Flow (live link) + coming soon card with shimmer animation
- ✅ Fully responsive — mobile, tablet, desktop
- ✅ No `any` types — fully typed TypeScript

## License

© 2026 Vexi Ltd. All rights reserved.
