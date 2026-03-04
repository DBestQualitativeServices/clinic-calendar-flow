# PolBine Style Guide

**Stack:** React 18 + Vite + Tailwind CSS + shadcn/ui
**Theme:** Medical Blue (#0274be) + Healing Teal (#37bfa7)
**Background:** `/bg-banner.jpg` with overlay `rgba(255,255,255, 0.4)`

## Colors

### Brand
```
Blue:        #0274be  →  hover: #16548b
Teal:        #37bfa7  →  light: #8fe1a2
Background:  #f5f5f5
Text:        #3a3a3a
```

### Semantic / Feedback
```
Success:   #10b981    Warning:  #f59e0b
Error:     #ef4444    Info:     #3b82f6
```

### Medical Status
```
Active:    #16a34a (green)    Scheduled: #3b82f6 (blue)
Completed: #6b7280 (gray)    Cancelled: #ef4444 (red)
Pending:   #f59e0b (amber)
```

## Typography

**Font:** system font stack (`-apple-system, Segoe UI, Roboto, sans-serif`)

**Sizes** (medical-optimized for accessibility):
```
12px  very-small  — timestamps, badges
13px  smaller     — secondary text
14px  small       — standard body text ★
16px  medium      — default base
18px  large       — form labels
20px  larger      — section headers
24px  very-large  — page titles
32px  extra-large — major headings
```

**Weights:** 400 / 500 / 600 / 700 / 800
**Line heights:** tight 1.25 · normal 1.5 · relaxed 1.75

## Spacing & Layout

```
Base unit: 4px (0.25rem)
Content padding: 20px / 28px (md)
Section padding: 20px / 28px (lg)
Sidebar width: 18rem   |   Header height: 3rem
```

**Breakpoints:** 450 / 640 / 768 / 1024 / 1280 / 1536px

## Border Radius & Shadows

```
Radius:  sm 4px · md 6px ★ · lg 8px · xl 12px · 2xl 16px · full
Shadow:  flat → raised → card → dropdown → modal
```

## Interactions

```
Transitions: fast 150ms · normal 300ms · slow 500ms
Easing:    ease-in-out (general) · ease-out (enter) · ease-in (exit)
Z-index:   base 0 · sticky 20 · overlay 30 · modal 40 · dropdown 50 · toast 10000
```

## Component Visual Rules

| Component | Details |
|-----------|---------|
| **Sidebar nav active** | `bg blue` + `text white` + `border-left 3px teal` |
| **Card** | `bg rgba(white, 0.4)` + `border 1px #e5e5e5` + `radius lg` |
| **Card emphasis** | gradient white→gray + `border 2px blue` + `shadow card` |
| **Table header** | `bg gray-100` + `text gray-600` + uppercase + `border-bottom 2px` |
| **Table cell** | padding `14px 16px` + `text-small` + `text-dark` |
| **Input focus** | `border blue` + `box-shadow 0 0 0 3px blue/10%` |
| **Scrollbar (table)** | thumb `gray-400` / track `gray-100` |
| **Scrollbar (form)** | thumb `brand-blue` / track `#f5f5f5` |
| **Pagination** | `bg rgba(white, 0.3)` + `border-top gray-200` |

## Appointment Status Colors (SACRED)

These colors are ONLY for appointment status. Never reuse for other purposes.

| Status | Background | Effect |
|--------|-----------|--------|
| Programat | Medium blue | Solid |
| Sosit | Light green | Animated pulse/glow |
| In consult | Intense green | Solid, no animation |
| Finalizat | Light gray | ~50% opacity |
| Anulat | Gray | Strikethrough text |
| No-show | Light red | Solid |
| Doctor block | — | Hatched/striped pattern |
