

# Status implementare vs. Plan

## Implementat deja
- **Phase 1** — Foundation & Theme (types, CSS variables, status colors, Tailwind config)
- **Phase 2** — Calendar daily view (doctor columns, time rows, 15-min midlines, headers with specialty chips and load indicator, vacation overlay, hatched blocked slots)
- **Phase 3** — Appointment cards (proportional height, status colors, pulse animation on Sosit, family badge)
- **Phase 5** — Global Toolbar (logo, "Programare nouă", specialty filter, date navigation)
- **Phase 6** — Walk-in zone (collapsible, compact cards)
- **Phase 7** — Empty slot popover (Programare nouă + Blocare interval)
- **Phase 8** — Booking panel (patient search, consultation selector, multi-patient, recurring UI, slot list, confirmation + SMS toggle) — partial: recurring auto-generation and "View on calendar" micro-flow are missing
- **Phase 9** — Appointment popover (status-conditional actions, check-in with incomplete data banner, cancel dialog)
- **Phase 10** — Appointment details panel (patient/doctor info, timeline, notes, action buttons)
- **Phase 14** — Auto-transition Sosit → In consult (interval in AppProvider)

## Neimplementat

### 1. Weekly per-doctor view (Phase 2 partial)
- Double-click on doctor header → switch to weekly view (columns = Mon–Sat)
- "Back to daily" button in toolbar
- Smooth transition animation
- CalendarGrid currently only renders daily view

### 2. Drag & Drop (Phase 4 — entirely missing)
- Vertical drag on same column to change time (Programat/Sosit)
- Horizontal drag to change doctor (Programat only) with specialization validation
- Walk-in cards draggable from walk-in zone onto calendar slots
- Visual feedback: ghost card, green valid slots, orange overlap outline
- Confirmation dialog for doctor changes
- SMS warning on move if SMS was sent
- Snap-back animation on invalid drop

### 3. "View on calendar" micro-flow (Phase 8 partial)
- Button in booking panel that temporarily closes panel, highlights available slots on calendar, user clicks a slot, panel reopens with selection applied

### 4. Recurring appointment auto-generation (Phase 8 partial)
- Currently only has UI (checkbox + frequency + count) but `handleConfirm` creates a single appointment — does not auto-generate recurring occurrences on available slots

### 5. Finalization Modal (Phase 11 — entirely missing)
- Centered modal with overlay when "Finalizează" is clicked
- Appointment summary
- Interactive non-blocking checklist: Payment done, Documents printed, Next appointment created
- Each checklist item with inline action button
- "Finalize and close" always active

### 6. Patient Form — complete variant (Phase 12 — entirely missing)
- Full patient form in shared slide-in container (all fields: name, CNP, DOB, phone, email, address, medical notes)
- Triggered at check-in for incomplete patients, or from details panel
- PanelContainer references `patientForm` type but no `PatientFormPanel` component exists
- Validation (CNP format, phone format)

### 7. No-show Notification Banner (Phase 13 — entirely missing)
- Persistent banner below toolbar when previous-day appointments remain unresolved
- Expandable list with per-appointment actions: Mark no-show, Was present, Reschedule
- Dismissible but reappears until all resolved

### 8. Overlapping cards side-by-side (Phase 3 partial)
- Spec says overlapping appointments on same doctor should display side-by-side (half-width) like Google Calendar — not currently implemented in DoctorColumn

## Proposed implementation order

**Batch 1** — Complete missing core features:
1. Finalization Modal (Phase 11)
2. Patient Form complete variant (Phase 12)
3. No-show Banner (Phase 13)
4. Recurring auto-generation logic in BookingPanel
5. Overlapping cards side-by-side layout

**Batch 2** — Advanced interactions:
6. Weekly per-doctor view
7. Drag & Drop (full Phase 4)
8. "View on calendar" micro-flow

