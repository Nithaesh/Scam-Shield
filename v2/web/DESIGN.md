# Scam Shield Design System & Specification

## 1. Concept: The Investigation Desk
A suspicious message is evidence. Five specialized agents examine it in real-time. An evidence trail builds deliberately on screen, culminating in a clear, authoritative verdict stamp. Technical trust over hacker cosplay; restraint and honesty over decorative noise.

### Calibrated Dials
- **Visual Variance**: 7 (purpose-built layouts per section, technical spec sheets, bento grids with asymmetric spans)
- **Motion Intensity**: 4 (deliberate, informative, transform/opacity only, single coordinated moments)
- **Information Density**: 5 on landing / 7 in console (dense, legible, tabular data with human summaries)
- **Asset Dependence**: 2 (pure vector SVG and typography; zero raster photography or AI illustrations)
- **Brand Fidelity**: 8 (bespoke design language; no templated SaaS clones)

### The Signature Element
The **Live Agent Pipeline**: an n8n-style visual node graph where message packets travel across bezier curves through parallel analysis nodes, handling true/false branches, and landing in a mechanical spring-loaded verdict stamp.

---

## 2. Color System

### Dark Theme (Default)
| Token | Variable | Hex / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Page** | `--page` | `#080F1D` (ink-950) | Root canvas background |
| **Panel** | `--panel` | `#0C1730` (ink-900) | Structural containers and cards |
| **Raised** | `--raised` | `#111F3D` (ink-850) | Interactive elements, inputs, docks |
| **Hairline** | `--hairline` | `rgba(160, 185, 235, 0.12)` | Subtle borders and dividers |
| **Text Primary**| `--text` | `#E9EEF8` (paper) | High-contrast body and headers |
| **Text Secondary**| `--fog` | `#93A3C2` (fog) | Metadata, captions, secondary labels |
| **Signal Action**| `--signal` | `#6EA8FF` | Primary CTA, focus rings, active nodes |
| **Text on Signal**| `--text-on-signal` | `#06122B` | Contrast text on signal buttons |

### Light Theme
| Token | Variable | Hex / Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Page** | `--page` | `#F4F6FB` | Root canvas background |
| **Panel** | `--panel` | `#FFFFFF` | Structural containers and cards |
| **Raised** | `--raised` | `#EAEFF8` | Interactive elements, inputs, docks |
| **Hairline** | `--hairline` | `rgba(14, 25, 48, 0.12)` | Subtle borders and dividers |
| **Text Primary**| `--text` | `#0E1930` | High-contrast body and headers |
| **Text Secondary**| `--fog` | `#4B5B7A` | Metadata, captions, secondary labels |
| **Signal Action**| `--signal` | `#1F5FD6` | Primary CTA, focus rings, active nodes |
| **Text on Signal**| `--text-on-signal` | `#FFFFFF` | Contrast text on signal buttons |

### Verdict & Risk Palette (Consistent Across Themes)
*Verdict colours are reserved EXCLUSIVELY for verdict stamps, status rings, and risk callouts.*
- **Safe**: `#16a34a` (Dark text tint: `#4ADE80`, Surface: `rgba(22, 163, 74, 0.12)`)
- **Warn / Suspicious**: `#f59e0b` (Dark text tint: `#FBBF24`, Surface: `rgba(245, 158, 11, 0.12)`)
- **Scam**: `#dc2626` (Dark text tint: `#F87171`, Surface: `rgba(220, 38, 38, 0.12)`)
- Contrast verification: Every text/background pair achieves WCAG AA minimum 4.5:1 ratio.

---

## 3. Typography & Typesetting

### Typefaces (via `next/font`)
1. **Display**: `Bricolage Grotesque` (weights 600, 700) — Used for h1, h2, verdict stamps.
2. **Body & Devanagari**: `Mukta` (weights 400, 500, 700) — Used for all body prose, navigation, buttons, and Hindi text.
3. **Data-Only**: `JetBrains Mono` (weights 400, 500) — Reserved strictly for URLs, phone numbers, timestamps, durations, and case IDs. Never used for decorative headings or arbitrary eyebrow text.

### Fluid Typography Scale
- **Hero H1**: `clamp(2.6rem, 7.5vw, 6.5rem)`, tracking `-0.03em`, leading `0.98` (Latin) / `1.18` (`:lang(hi)`).
- **H2**: `clamp(1.9rem, 4vw, 3.25rem)`, tracking `-0.02em`.
- **H3**: `1.375rem` (22px), font-weight 600.
- **Body**: `1.125rem` (18px minimum for citizen accessibility), leading `1.6`.
- **Metadata**: Never below `0.875rem` (14px).
- **Line Length**: Max 68 characters for optimal reading ergonomics.
- **Sentence Case Everywhere**: Titles, buttons, and badges follow natural sentence case.

---

## 4. Shape, Elevation & Background

- **Radius Scale**:
  - `12px`: Inputs, chips, small inner cards.
  - `18px`: Squircle agent node tiles.
  - `20px`: Major panels and sections.
  - `9999px`: Pills and status chips.
- **Elevation**: Flat, technical depth created through `1px solid var(--hairline)` and a subtle `inset 0 1px 0 rgba(255, 255, 255, 0.06)` top highlight. Zero drop shadows.
- **Background**:
  - Soft radial ambient glow: `radial-gradient(ellipse at 15% 10%, rgba(110, 168, 255, 0.14), transparent 60%)` behind top-left hero.
  - 3% grain overlay from an inline SVG data URI.

---

## 5. Motion Tokens & Physics

Powered strictly by **Framer Motion via LazyMotion with domAnimation**. Only `transform` and `opacity` are animated.

- **Ease Out**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Ease In-Out**: `cubic-bezier(0.76, 0, 0.24, 1)`
- **Verdict Stamp Spring**: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Durations**:
  - Micro-interactions (hover, active): `150ms`
  - Node transitions: `250ms`
  - Packet travel & reveals: `400ms`
  - Stamp impact: `250ms` (scale 1.15 -> 1.0, rotate -4deg -> -2deg)
  - Logo stroke draw: `600ms`
- **Reduced Motion (`prefers-reduced-motion`)**:
  - Every animation provides an instant static or 150ms fade equivalent.
  - Pipeline graphs display the final evaluated state with no packet movement.
  - Zero continuous pulsing.

---

## 6. The Strict DO-NOT List

To prevent generic AI templates and maintain craftsmanship:
1. ❌ **NO stock photos, AI-generated people, or fabricated human faces**.
2. ❌ **NO emoji used as icons** (use vector Lucide icons exclusively).
3. ❌ **NO purple-to-pink, rainbow, or generic gradient backgrounds**.
4. ❌ **NO Inter, Roboto, or Arial typography**.
5. ❌ **NO all-caps eyebrow labels above headings**.
6. ❌ **NO spaced em-dash labels (`WORD — text`)**.
7. ❌ **NO arrows appended to button text (`Check →`)**.
8. ❌ **NO highlighting a single word in a headline** (second line in action color as a full line only).
9. ❌ **NO identical-card three-column grids** (use asymmetric technical spec bento grids).
10. ❌ **NO auto-rotating carousels**.
11. ❌ **NO parallax with `background-attachment: fixed`**.
12. ❌ **NO custom cursors or smooth-scroll hijacking libraries**.
13. ❌ **NO 3D Canvas or WebGL dependencies**.
14. ❌ **NO `dangerouslySetInnerHTML`** (all model output rendered as plain text).
15. ❌ **NO active clickable links for suspicious URLs** (defang as `example[.]com`).
