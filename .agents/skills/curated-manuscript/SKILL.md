---
name: curated-manuscript
description: Design system for the Tredyffrin Easttown Historical Society public site. Use when editing Astro pages, components, layouts, or CSS so UI matches The Curated Manuscript (parchment/ink, editorial museum aesthetic) instead of generic dashboard or shadcn layouts.
paths:
  - "**/*.astro"
  - "**/*.css"
  - "docs/DESIGN.md"
---

# Curated Manuscript

Read [docs/DESIGN.md](../../../docs/DESIGN.md) before changing visual design. Tokens live in `src/styles/global.css` (`@theme inline`). Use those utilities; do not invent a new palette, type system, or look.

This skill overrides generic frontend taste (Inter, purple gradients, large rounded cards, shadcn defaults).

## North star

High-end museum / rare book room. Clinical precision, editorial elegance, generous white space. Scholar in a private vault, not a database UI.

## Surfaces and borders

- Canvas: `bg-surface`. Section with `bg-surface-container-low` or `bg-surface-container`.
- No 1px solid borders for sectioning. Depth is stacked paper, not lines.
- Ghost border only for a11y: `outline-variant` at ~20% opacity (inputs may use 40% on the bottom edge).
- Floating nav: `bg-surface/80` and `backdrop-blur-[20px]` (see `Layout.astro`).
- Ambient shadows only on overlays/previews: 24–48px blur, 4–6% `on-surface`. Not heavy drop shadows.

## Type

- Display / headlines: `font-display` (Newsreader). Hero titles: `text-display-sm` or `text-display-lg`.
- UI, body, labels, metadata: `font-sans` (Public Sans). Eyebrows: small uppercase tracking.
- Secondary copy: `text-on-surface-variant`. Never 100% black; use `text-on-surface` / `text-on-background`.

## Components

- Primary button: `bg-primary` / `text-on-primary`, `rounded-sm` (0.125rem) or none. Not `rounded-lg`.
- Secondary: `bg-secondary-container` / `text-on-secondary-container`.
- Editorial link: Newsreader, underline in `primary-fixed`, no fill.
- Cards: `bg-surface-container-low`, hover to `bg-surface-container-highest` plus ambient shadow. Padding at least `p-8`. No divider lines.
- Inputs: `bg-surface-container-lowest`, bottom border `outline-variant` 40%; focus `primary` plus `primary-container` glow.
- Metadata chips: `bg-secondary-fixed` `text-on-secondary-fixed` `font-sans`.

## Layout

Asymmetry and large margins are intended. Do not tighten everything into a SaaS grid.
