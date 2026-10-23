---
name: Adaptive Planner Design System
description: Calm, human-centered, decision-first productivity interface
colors:
  primary: "#2d5a43"
  primary-hover: "#1e3a2f"
  brand-light: "#e2ede7"
  brand-surface: "#f2f7f4"
  neutral-bg: "#fbfbf9"
  surface: "#ffffff"
  surface-subtle: "#f5f4ef"
  border: "#e7e5e0"
  border-subtle: "#f0ede8"
  text-main: "#1c1917"
  text-muted: "#57534e"
  text-subtle: "#78716c"
  success: "#2d6a4f"
  success-bg: "#eaf4ee"
  warning: "#b45309"
  warning-bg: "#fef3c7"
  critical: "#b91c1c"
  critical-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
---

## Overview

Adaptive Planner is an AI-assisted planning companion designed around psychological safety, calm focus, and realistic capacity management. The interface avoids aggressive red warnings, gamified streaks, and guilt-inducing alarms. Every visual element emphasizes clarity, achievable next actions, and transparent trade-offs.

## Colors

- **Primary Action (`#2D5A43` / `#1E3A2F`):** Deep forest green grounding the user in growth, balance, and intentional focus. Used for primary actions, active navigation states, and confirmed progress.
- **Warm Neutral Canvas (`#FBFBF9` / `#FFFFFF`):** Soft, warm neutral background with pure white card surfaces to prevent visual glare and digital fatigue.
- **Subtle Borders (`#E7E5E0`):** Soft sand-tinted boundaries offering clean spatial separation without aggressive contrast.
- **Supportive Feedback:**
  - Success (`#2D6A4F` on `#EAF4EE`): Calm reassurance for completed tasks and valid roadmaps.
  - Attention / Buffers (`#B45309` on `#FEF3C7`): Calm heads-up for schedule trade-offs and capacity adjustments.
  - Critical Conflict (`#B91C1C` on `#FEF2F2`): Reserved strictly for authentic errors and direct schedule overlaps.

## Typography

- Modern sans-serif stack (`Inter, system-ui, sans-serif`) with tabular numbers for estimates, percentages, and timestamps.
- Tight tracking on titles (`-0.02em`) with generous line-height on descriptions (`1.5`) for effortless scanning.

## Layout

- **Desktop:** Persistent collapsible sidebar (240px) with dedicated workspace content area max-w-6xl centered.
- **Mobile:** Adaptive top header with slide-over drawer and thumb-friendly bottom action bars.
- **Rhythm:** Generous 24px/32px section gaps preventing cramped dashboard feeling.

## Elevation & Depth

- Low-elevation philosophy: Subtle 1px borders (`#E7E5E0`) paired with whisper shadows (`shadow-xs` / `shadow-sm`).
- Elevated surfaces (Modals, Dropdowns) use soft backdrop blurs (`backdrop-blur-sm`) over warm translucent overlays (`bg-stone-900/20`).

## Shapes

- Rounded rectangular cards with smooth `14px` (lg) to `18px` (xl) radius.
- Buttons and inputs standard `10px` (md) radius for comfortable click/tap targets.

## Components

- **Action Controls (`Button`):** Primary, Secondary, Ghost, Outline, and Destructive variants with smooth 150ms transitions and distinct focus rings.
- **Cards (`Card`, `CardHeader`, `CardBody`):** White background, border-[#E7E5E0], modest inner padding (20px to 28px).
- **Status Badges (`Badge`):** Tinted backgrounds paired with companion status text and icons, never relying on color alone.
- **Feedback & Loaders:** Subtle skeleton loaders, smooth progress meters, and calm inline alerts.

## Do's and Don'ts

### Do
- Provide transparent explanations of time trade-offs.
- Highlight the single next useful action for today.
- Include cognitive pauses (10-15 min) between scheduled work blocks.
- Preserve user input during any network or AI fallback.

### Don't
- Never use accusatory language like "You failed" or "Overdue!".
- Do not make every card a different vibrant color.
- Never silently reschedule or prune user tasks in the background without explicit confirmation.
