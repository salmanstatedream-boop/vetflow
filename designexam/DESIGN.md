---
name: Phoenix OS Narrative
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#c0c7d4'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#8a919d'
  outline-variant: '#404752'
  surface-tint: '#a0caff'
  primary: '#a0caff'
  on-primary: '#003259'
  primary-container: '#4da6ff'
  on-primary-container: '#003a67'
  inverse-primary: '#0061a5'
  secondary: '#ffb68e'
  on-secondary: '#532200'
  secondary-container: '#ea6b00'
  on-secondary-container: '#491d00'
  tertiary: '#ffb956'
  on-tertiary: '#452b00'
  tertiary-container: '#de9200'
  on-tertiary-container: '#503200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0caff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#00497e'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#763300'
  tertiary-fixed: '#ffddb5'
  tertiary-fixed-dim: '#ffb956'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

This design system embodies an ultra-premium, futuristic operating environment. It leverages a high-concept **Glassmorphism** and **Minimalist** hybrid style, prioritizing "Apple-level" polish through meticulous attention to translucency, light refraction, and negative space. 

The atmosphere is dark, cinematic, and focused, utilizing deep blacks to create infinite depth while electric accents provide functional energy. The target audience expects a frictionless, high-performance interface that feels both powerful and ethereal. Emotional responses should range from awe to a sense of absolute precision.

## Colors

The palette is rooted in a "True Dark" foundation. 
- **Primary (Electric Blue):** Used for critical actions, active states, and focus indicators. It represents the "OS Core."
- **Secondary (Phoenix Orange):** Reserved for high-alert notifications, destructive actions, or unique branding moments that represent the "Phoenix" spirit.
- **Neutrals:** The background is near-absolute black (#050505) to allow OLED displays to vanish. Surfaces use a slightly lighter tint (#0B0B0F) to establish subtle layering.
- **Typography:** Pure White is for primary information; Secondary Gray (#A0A7B4) is for metadata and deactivated states.

## Typography

This design system utilizes **Hanken Grotesk** for its sharp, modern grotesque characteristics that feel both engineered and approachable. For technical data and UI labels, **Geist** provides a monospaced-influenced clarity that reinforces the "OS" aesthetic.

Hierarchy is driven by massive scale contrasts rather than heavy weights. Large display type should be used sparingly against vast whitespace to create a "Gallery" effect.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with intentional "dead zones" of whitespace to prevent information density fatigue. 

- **Desktop:** 12-column grid with generous 64px side margins to center the focus.
- **Tablet:** 8-column grid with 32px margins.
- **Mobile:** 4-column grid with 20px margins.

Spacing follows a strict 8px linear scale. For ultra-premium feel, favor larger padding (e.g., 48px or 64px) between sections to allow individual elements to "breathe" like luxury products.

## Elevation & Depth

Depth is not communicated through traditional drop shadows, but through **Backdrop Blurs** and **Luminous Borders**.

1.  **Base Layer:** #050505 Background.
2.  **Surface Layer:** #0B0B0F with a 1px solid border at 8% opacity white.
3.  **Floating Layer:** Semi-transparent containers (rgba(11, 11, 15, 0.6)) with `backdrop-filter: blur(20px)`.
4.  **Active State:** Elements may emit a faint, colored "glow" (0px 0px 20px) using the Primary Electric Blue at low opacity (15-20%) to simulate light emission.

## Shapes

The shape language is sophisticated and controlled. A default **Rounded (0.5rem)** corner is used for standard interactive elements. Larger containers and cards use **rounded-xl (1.5rem)** to create a softer, more protective feel around content. Hexagonal motifs—inspired by the reference imagery—can be used for decorative masking or icon backgrounds to reinforce the futuristic theme.

## Components

- **Buttons:** Primary buttons use a solid Electric Blue fill with white text. Secondary buttons use a glass background (blurred) with a 1px translucent border and white text.
- **Input Fields:** Minimalist underlines or 1px bordered boxes. On focus, the border transitions to Primary Blue with a subtle outer glow.
- **Cards:** Must feature the `backdrop-filter` blur and a 1px top-light border (a gradient border that is more visible at the top than the bottom) to simulate physical light hitting an edge.
- **Chips:** Small, pill-shaped elements with Geist font, used for status or filtering, featuring a low-opacity fill of the status color (e.g., Blue for "Active").
- **Glass Sliders:** Thin tracks with a high-contrast white thumb, using translucency to show the background through the track.