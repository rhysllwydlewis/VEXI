# Vexi

Landing page for [vexi.co.uk](https://vexi.co.uk) — the technology group behind a growing portfolio of digital platforms.

## About

Vexi is a tech-forward parent company powering products like [Event Flow](https://event-flow.co.uk) and more to come.

## Tech Stack

- **Next.js 14+** — App Router, TypeScript, SSR/SSG
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Page animations, scroll triggers, modal transitions
- **TypeScript** — Type-safe code throughout
- **Inter** — Via `@fontsource/inter` (self-hosted, no external network dependency at build time)

## File Structure

```
vexi/
├── app/
│   ├── layout.tsx              # Root layout: Inter font, metadata
│   ├── page.tsx                # Main page composing all sections
│   ├── globals.css             # Tailwind directives + custom keyframes
│   └── api/
│       └── contact/
│           └── route.ts        # POST API endpoint for contact form
├── components/
│   ├── Navbar.tsx              # Fixed transparent navbar
│   ├── Hero.tsx                # Full-viewport hero section
│   ├── AnimatedBlobs.tsx       # CSS animated background gradient shapes
│   ├── ParticleField.tsx       # Floating dot/particle effect
│   ├── About.tsx               # About section with glassmorphism cards
│   ├── Portfolio.tsx           # Brand showcase grid
│   ├── Footer.tsx              # Minimal dark footer
│   └── ContactWidget.tsx       # Modal overlay contact form widget
├── public/
│   └── favicon.ico
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```

## Deployment (Railway)

Railway auto-detects Next.js projects:

- **Build command:** `npm run build`
- **Start command:** `npm start`
- **Port:** 3000 (Next.js default)
- No environment variables required

## License

© 2026 Vexi Ltd. All rights reserved.
