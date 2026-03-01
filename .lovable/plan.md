

# Plan: Medical Forms Module

## Overview
Add a medical forms management system to the existing clinic scheduling app. Two interfaces: reception desk (desktop, integrated with sidebar nav) and patient tablet (separate `/tablet` route, touch-optimized). This is a large feature — I'll implement it in two batches.

## What changes

### 1. Types & Mock Data
- Add to `src/types/index.ts`: `FormTemplate`, `FormQuestion`, `CompletedForm`, `TabletSession`, `ConsultFormRequirements`
- Add to `src/data/mock.ts`: all 5 form templates, `consultFormRequirements` map (consultation name → template IDs), sample `completedForms` (valid, expired, none scenarios), sample `tabletSessions`

### 2. Forms State in appStore
- Add `completedForms`, `tabletSessions` arrays to `AppProvider` state
- Add actions: `addCompletedForm`, `addTabletSession`, `removeTabletSession`
- Expose a helper `getFormsStatus(appointmentId)` that computes required vs completed/valid forms for a given appointment

### 3. Sidebar Navigation (A5)
- Create `src/components/layout/SidebarNav.tsx` — dark background (`#1B2A3D`), collapsible (icon-only mode), state persisted in `localStorage`
- Items: Programări (`/scheduling`), Formulare (`/forms`), Pacienți/Consulturi/Setări (placeholders)
- Create `src/components/layout/AppLayout.tsx` — wraps sidebar + content area
- Restructure routing in `App.tsx`:
  - `/scheduling` → existing Index content (calendar)
  - `/forms` → FormsPage
  - `/patients`, `/consultations`, `/settings` → placeholder pages
  - `/` redirects to `/scheduling`
  - `/tablet` → tablet flow (NO sidebar, separate layout)
- Move `AppProvider` up into `AppLayout` so state is shared across reception pages

### 4. FormsStatusBadge (A1)
- Create `src/components/forms/FormsStatusBadge.tsx` — small chip showing `completed/total` with green/orange/red background
- Uses `getFormsStatus()` helper to compute counts from consultation types → required form templates → completed forms
- Integrate into existing `AppointmentCard.tsx`, `AppointmentPopover.tsx`, `AppointmentDetailsPanel.tsx`

### 5. FormsStatusPanel (A2)
- Create `src/components/forms/FormsStatusPanel.tsx` — detailed forms section
- Shows each required form with status badge (Valid/Pending/Expirat), dates
- Tablet access code display with Copy + Regenerate buttons
- Multi-patient support with tabs
- Integrate as a section inside `AppointmentDetailsPanel.tsx`

### 6. FormsChecklistItem (A3)
- Add forms line to `FinalizationModal.tsx` checklist — shows `X/Y` status, expandable list of missing forms if incomplete, non-blocking

### 7. FormsPage (A4)
- Create `src/pages/FormsPage.tsx` — patient search bar, table of form history with columns (Form, Date, Expires, Status, Appointment)
- Filter: All/Valid/Expired, sorted by most recent

### 8. Tablet Interface (B1-B4)
- Create `src/pages/tablet/TabletLogin.tsx` — centered layout, OTP-style 4-digit input (using existing `input-otp`), large touch buttons, validates against `tabletSessions`
- Create `src/pages/tablet/TabletFormsList.tsx` — greeting header, pending forms (orange accent cards) + completed forms (gray), "Verifică formulare noi" button, "Ieșire" button
- Create `src/pages/tablet/TabletFormView.tsx` — scrollable questions (large checkboxes, radio chips, textareas), HTML5 canvas signature pad (touch/mouse), "Confirm și trimite" button (disabled until required fields + signature), saves as base64
- Create `src/pages/tablet/TabletLayout.tsx` — wrapper with inactivity timeout (10min), overlay on expiry, resets to login
- All tablet pages use large fonts (18px+ body), 48px+ buttons, single column, calm medical palette

### 9. Signature Canvas
- Create `src/components/tablet/SignatureCanvas.tsx` — HTML5 canvas with touch/mouse drawing, "Șterge semnătura" reset button, exports as base64 PNG data URL

## File inventory (new files)
```
src/types/index.ts (extend)
src/data/mock.ts (extend)
src/store/appStore.tsx (extend)
src/components/layout/SidebarNav.tsx
src/components/layout/AppLayout.tsx
src/components/forms/FormsStatusBadge.tsx
src/components/forms/FormsStatusPanel.tsx
src/pages/FormsPage.tsx
src/pages/tablet/TabletLogin.tsx
src/pages/tablet/TabletFormsList.tsx
src/pages/tablet/TabletFormView.tsx
src/pages/tablet/TabletLayout.tsx
src/components/tablet/SignatureCanvas.tsx
src/App.tsx (restructure routes)
```

## Files modified
```
src/components/calendar/AppointmentCard.tsx (add FormsStatusBadge)
src/components/calendar/AppointmentPopover.tsx (add FormsStatusBadge)
src/components/panels/AppointmentDetailsPanel.tsx (add FormsStatusPanel)
src/components/modals/FinalizationModal.tsx (add FormsChecklistItem)
src/pages/Index.tsx (extract calendar content for reuse in routing)
```

## Implementation order
1. Types, mock data, state extensions
2. Sidebar + routing restructure + AppLayout
3. FormsStatusBadge + integrations into existing components
4. FormsStatusPanel + FormsPage
5. FormsChecklistItem in FinalizationModal
6. Tablet interface (login → forms list → form view → signature → timeout)

## STATUS: ✅ FULLY IMPLEMENTED
