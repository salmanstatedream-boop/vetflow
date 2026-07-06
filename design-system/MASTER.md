# Phoenix OS — Design System (Master)

Generated from ui-ux-pro-max guidance for veterinary clinic SaaS landing pages.

## Pattern

Hero-centric landing with progressive disclosure: Hero → proof → how it works → features → verticals → trust → pricing → FAQ → CTA.

## Style

Dark professional glassmorphism. Deep navy base, cyan accent, restrained motion (150–300ms color transitions).

## Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--phx-bg` | `#03040A` | Page background |
| `--phx-bg-alt` | `#070A12` | Alternate section bands |
| `--phx-panel` | `#0B1020` | Cards, panels, modals |
| `--phx-cyan` | `#22D3EE` | Primary accent, CTAs, eyebrows |
| `--phx-blue` | `#3B82F6` | Secondary accent, gradients |
| `--phx-violet` | `#8B5CF6` | Tertiary accent |
| `--phx-text` | `#F8FAFC` | Headings |
| `--phx-muted` | `#94A3B8` | Body text |
| `--phx-label` | `#64748B` | Labels, captions |

## Typography

- Display/headings: `var(--font-display)` (Plus Jakarta Sans)
- Body: `var(--font-sans)` (Geist)
- Eyebrows: monospace, 0.75rem, 0.22em tracking, uppercase, cyan

## Radius

- Cards: `1rem`
- Pills/chips: `9999px` or `0.75rem`
- Nav pill: `1rem` (`rounded-2xl`)

## Motion

- Hover: `transition-colors duration-200`
- Scroll reveals: IntersectionObserver + stagger (respect `prefers-reduced-motion`)
- Avoid layout-shifting scale on large cards

## Anti-patterns

- No emoji icons — use Lucide SVG
- No RGB rainbow cycling on borders — calm cyan/blue sheen only
- No repeating module lists across sections
- Floating nav needs inset spacing (`top-4`), not flush `top-0`
- Muted text minimum `#64748B` on dark panels

## Interaction checklist

- `cursor-pointer` on all clickable elements
- `focus-visible:ring-2 focus-visible:ring-[#22D3EE]/40` on buttons/links
- Marquee continues on hover; no text cursor on chips

## App surfaces (dashboard, auth, booking)

Phoenix tokens on `:root` map into ClinicOS semantic Tailwind colors so existing `bg-surface`, `text-primary`, and `glass-panel` classes inherit the Phoenix look without layout changes.

| Semantic token | Dark | Light (adapted) |
|----------------|------|-----------------|
| `--color-surface` | `--phx-bg` `#03040A` | `#F5F7FA` |
| `--color-surface-container` | `--phx-panel` `#0B1020` | `#FFFFFF` |
| `--color-primary` | `--phx-cyan` `#22D3EE` | `#0891B2` |
| `--color-on-primary` | `#03040A` | `#FFFFFF` |
| `--color-secondary` | `--phx-blue` `#3B82F6` | `#2563EB` |

**App utilities:** `.app-heading`, `.app-eyebrow`, `.app-focus-ring`, `.app-btn-primary` (cyan→blue gradient primary CTA).

**Charts:** `lib/ui/dashboard-tokens.ts` — primary `#22D3EE`, secondary `#3B82F6`.

**Do not** wrap dashboards in `.phx-page`; use semantic tokens + app utilities only.
