<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# abdlmnn Portfolio — Project Rules

## Purpose

This is a **marketing instrument**, not a resume. Every section exists to convert a visitor into a client or hiring manager. The site markets `abdlmnn` as a full-stack developer who ships real products for real clients.

**Audience:** Clients, founders, hiring managers who need someone who can build.

**Goal:** Prove capability, demonstrate range, make it effortless to get in touch.

## Design Principles

- **Unique over trendy** — Bold editorial: distinctive Solarized-Osaka tokens (light + dark), generous type, unusual grid breaks. Stands out from dark-mode SaaS clones.
- **Outcome-oriented** — Copy answers "what's in it for them," not "here's my resume."
- **Show, don't tell** — Interactive elements over static icon grids. Live moments over dead lists.
- **Every section earns its place** — If a section doesn't convert, it gets cut. No filler.
- **No weakness-framing** — No "learning X," no empty states, no apologies. Confidence through specificity.

## Code Standards

- **Zero dead code** — Every component, every export, every line is used. If it's not rendered or imported, it doesn't exist.
- **Zero repetition (DRY)** — Data lives in one place (`lib/data.ts`). Components consume it. No hardcoded copies.
- **Server Components by default** — Client components only where interactivity demands it (terminal, nav, theme toggle).
- **No unused dependencies** — If a package isn't actively used, it's not in package.json. CSS-first motion; no animation library unless genuinely needed.
- **TypeScript strict** — No `any`, no `@ts-ignore`. Types are precise.
- **Tailwind v4** — Design tokens in `@theme`, utility classes in markup. No inline styles unless dynamically computed.

## Content Rules

- **Real outcomes over duty descriptions** — "Built X" not "Responsible for X."
- **Specific over vague** — "Medicine delivery for 4 user roles" not "Healthcare app."
- **CTAs everywhere** — Nav, hero, footer. Never more than one scroll away from contact.
- **Placeholder content is temporary** — Marked clearly, replaced before launch.

## File Structure

```
app/
  layout.tsx            — Root layout, fonts, theme bootstrap
  page.tsx              — Composes the shell
  globals.css           — Theme tokens (Solarized Osaka), base styles
  components/
    shell.tsx           — Layout: sidebar + tab strip + content pane + shell/resume tabs
    sidebar.tsx         — nav groups (dirs, projects, net, files), terminal + theme actions, availability footer
    tabbar.tsx          — Tab strip (+, ×), mobile menu
    pane-terminal.tsx   — Full-pane terminal for shell tabs
    theme-toggle.tsx    — Light/dark switch
    reveal.tsx          — Scroll-reveal wrapper (client)
    hero.tsx            — whoami section
    proof.tsx           — shipped (project case studies)
    capabilities.tsx    — stack (what I build)
    process.tsx         — playbook (how we work)
    contact.tsx         — ping (CTA + links)
  lib/
    data.ts             — Single source of truth for all content
    theme.ts            — Theme helpers + pre-paint script
    shell.ts            — Shared terminal command engine
```
