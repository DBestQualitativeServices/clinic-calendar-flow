

# Plan: Sistem Programări Policlinică Medicală (Revised)

## Overview
A single-page appointment scheduling system for a medical clinic's reception desk, built around a central calendar view with contextual overlays (slide-in panels, popovers, modals). All data will be mock/local state initially — no backend.

## Phase 1 — Foundation & Theme
- Apply PolBine style guide: brand colors (#0274be blue, #37bfa7 teal), semantic/status colors, typography, spacing, shadows
- CSS variables and Tailwind config for all status colors (Programat=blue, Sosit=green pulse, In consult=solid green, Finalizat=gray, Anulat=gray strikethrough, No-show=red)
- Shared types: Doctor, Patient, Specialization (2-level), Consultation, Appointment, TimeBlock

## Phase 2 — Calendar (Core Component)
- **Daily view (default):** Columns = doctors, Rows = 08:00–18:00 in 30-min rows with dotted 15-min midlines
- **Doctor column headers:** Name, specialty chips (colored), daily load indicator bar
- **Weekly per-doctor view:** Double-click on doctor header; columns = Mon–Sat; "Back to daily" button
- Navigation: arrows + date picker, current day highlighted
- Doctor states: vacation (grayed column with overlay), partial unavailability (hatched pattern)
- Horizontal scroll if >5 doctors; empty state message

## Phase 3 — Appointment Cards on Calendar
- Cards with height proportional to duration: patient name, consultations (abbreviated), total duration, family badge
- Color-coded by status; "Sosit" gets subtle pulse/glow animation
- Overlapping cards side-by-side (half-width) like Google Calendar
- Click on card → opens appointment popover (Component 4)

## Phase 4 — Drag & Drop
- Vertical drag (change time) for Programat/Sosit; horizontal drag (change doctor) for Programat only, with specialization validation
- Walk-in cards draggable from "Fără Oră Fixă" zone onto calendar slots
- Visual feedback: ghost card, green highlight valid slots, orange outline on overlaps
- Confirmation dialog for doctor changes; instant apply for time changes with toast
- **SMS warning:** If appointment has a sent SMS confirmation, show extra warning: "Pacientul a primit SMS cu ora X. Muți la Y?" before applying
- Snap-back animation on invalid drop

## Phase 5 — Global Toolbar
- Logo + "Programare nouă" accent button
- Specialty filter (chips/dropdown) hiding non-matching doctor columns
- Date navigation (arrows + date picker + current date label)
- Mode indicator with doctor name + "Back to daily" in weekly mode

## Phase 6 — "Fără Oră Fixă" Zone
- Collapsible horizontal zone below toolbar, above calendar
- Compact draggable cards for walk-in appointments (grouped by doctor in daily view, per day-column in weekly view)
- Auto-expanded when walk-ins exist, collapsed otherwise

## Phase 7 — Component 1 & 3: Empty Slot Popover
- Components 1 and 3 from the spec are identical (Component 3 listed separately for inventory only)
- Click empty slot → popover with "Programare nouă" and "Blocare interval"
- Block interval: duration dropdown (15m/30m/1h/2h/rest of day/custom), optional reason, confirm/cancel
- **Blocking works for any day** — current day and future days alike
- Hatched pattern applied instantly with toast confirmation

## Phase 8 — Component 2: Booking Panel (Slide-in)
- Right slide-in panel (~35-40% width), calendar stays visible
- Single continuous scroll with 5 sections (not a wizard):
  1. **Patient:** Search (name/phone/CNP) with autocomplete → compact card; or "New patient" → inline 3 fields (name, DOB, phone)
  2. **Consultations:** 2-level hierarchical selector (Category → Type), chips with duration + X, "+ Add consultation", auto-calculated total duration
     - **Recurring option:** Checkbox → frequency dropdown (weekly/biweekly/monthly) + repetition count. System **auto-generates** all recurring appointments on available slots at confirmation
  3. **Additional patients:** "+ Add patient" link, duplicates sections 1+2, max 5 patients, summed durations
  4. **When:** Toggle "Specific doctor" / "Any available"; "Walk-in" checkbox; auto-generated slot list (8-10 slots)
     - **"View on calendar" micro-flow:** Button temporarily closes the panel, calendar highlights available slots for the selected consultations with a distinct color, reception clicks a highlighted slot, panel automatically reopens with the selection applied
     - Pre-filled doctor+time if opened from slot click
  5. **Confirmation:** Visual summary + "Confirm" button + SMS toggle
- Shares container with details panel and patient form — mutual exclusion

## Phase 9 — Component 4: Appointment Popover
- Click appointment card → contextual popover with patient name + status badge
- Status-conditional actions: Details, Check-in, Force "In consult", Reschedule, Cancel, Finalize
- **Check-in + incomplete data:** If patient has minimal info, banner appears in popover "Date incomplete — Completează acum". Clicking it opens the **full patient form (Component 7) in the shared slide-in container** (replacing any open panel)
- Cancel shows confirmation dialog; actions apply instantly with toasts

## Phase 10 — Component 5: Appointment Details Panel
- Slide-in right (same shared container)
- Patient info, appointment info, status badge, timeline/history, notes field
- Context-dependent primary action button + secondary actions

## Phase 11 — Component 6: Finalization Modal
- Centered modal with overlay
- Summary + non-blocking interactive checklist: Payment, Documents, Next appointment
- Each item has inline action button; "Finalize and close" always active

## Phase 12 — Component 7: Patient Form
- **Minimal variant** (3 fields inline): used in booking panel for new patients
- **Complete variant** (all fields, slide-in): opens in the **shared lateral container** — triggered at check-in if data incomplete, or from details panel
- Validation on save (CNP, phone format); pre-populates existing fields

## Phase 13 — Component 8: No-show Notification Banner
- Persistent banner below toolbar for unresolved previous-day appointments
- Expandable list with per-appointment actions: Mark no-show, Was present, Reschedule
- Dismissible but reappears until all resolved

## Phase 14 — Status Auto-transitions
- Periodic check (every minute): Sosit + current time ≥ appointment time → auto "In consult"
- Real-time visual update on calendar cards

## Mock Data
- 5-6 doctors with varied specializations across 3 categories
- ~15-20 sample patients
- Pre-populated appointments across different statuses
- Sample time blocks and a doctor on vacation

