

# Plan: Migrare mock → API cu React Query

## Overview
Create `src/hooks/api/` folder mirroring every export from `src/hooks/mock/index.ts`, using `useQuery`/`useMutation` + `apiFetch`. Then update `hooks/data/index.ts` to switch with one line. No visual changes.

## New files

### `src/hooks/api/index.ts`
Barrel file exporting all symbols — same names as `mock/index.ts`. Exports a no-op `MockDataProvider` wrapper and re-exports `FormsStatus` type.

### Query hooks (`src/hooks/api/queries/`)
Each file uses `useQuery` + `apiFetch`. 15 files:

| File | queryKey | Endpoint |
|------|----------|----------|
| `useDoctors.ts` | `['doctors']` | `GET /doctors` |
| `usePatients.ts` | `['patients', search]` | `GET /patients?search={search}` |
| `usePatientById.ts` | `['patients', id]` | `GET /patients/{id}` |
| `useCategories.ts` | `['categories']` | `GET /categories` |
| `useConsultationTypes.ts` | `['consultationTypes']` | `GET /consultation-types` |
| `useAppointments.ts` | `['appointments', date, doctorId]` | `GET /appointments?date=&doctorId=` |
| `useAppointmentById.ts` | `['appointments', id]` | `GET /appointments/{id}` |
| `useUnresolvedAppointments.ts` | `['appointments', 'unresolved']` | `GET /appointments?status=unresolved` |
| `useBlockedSlots.ts` | `['blockedSlots', date]` | `GET /blocked-slots?date=` |
| `useAvailableSlots.ts` | `['availableSlots', ...]` | `GET /appointments/available-slots?...` |
| `useFormTemplates.ts` | `['formTemplates']` | `GET /form-templates` |
| `useFormsStatus.ts` | `['formsStatus', aptId]` | `GET /appointments/{id}/form-readiness` |
| `useCompletedForms.ts` | `['completedForms', patientId]` | `GET /form-submissions?patientId=` |
| `useTabletSession.ts` | `['tabletSession', aptId]` | `GET /signing-sessions?appointmentId=` |
| `useTabletSessionByCode.ts` | `['tabletSession', 'code', code]` | `GET /signing-sessions/code/{code}` |

Special: `useFormsStatusForPatient` returns a callback that calls `apiFetch` directly (not a query hook).

### Mutation hooks (`src/hooks/api/mutations/`)
Each file uses `useMutation` + cache invalidation. 14 files:

| File | Method | Endpoint | Invalidates |
|------|--------|----------|-------------|
| `useCreateAppointment.ts` | POST | `/appointments` | `appointments` |
| `useUpdateAppointmentStatus.ts` | PATCH | `/appointments/{id}` | `appointments` |
| `useCheckinAppointment.ts` | POST | `/appointments/{id}/checkin` | `appointments` |
| `useCompleteAppointment.ts` | POST | `/appointments/{id}/complete` | `appointments` |
| `useCancelAppointment.ts` | POST | `/appointments/{id}/cancel` | `appointments` |
| `useMarkNoShow.ts` | POST | `/appointments/{id}/no-show` | `appointments` |
| `useRescheduleAppointment.ts` | POST | `/appointments/{id}/reschedule` | `appointments` |
| `useCreateBlockedSlot.ts` | POST | `/blocked-slots` | `blockedSlots` |
| `useDeleteBlockedSlot.ts` | DELETE | `/blocked-slots/{id}` | `blockedSlots` |
| `useSubmitForm.ts` | POST | `/form-submissions` | `completedForms`, `formsStatus` |
| `useCreatePatient.ts` | POST | `/patients` | `patients` |
| `useUpdatePatient.ts` | PUT | `/patients/{id}` | `patients` |
| `useCreateTabletSession.ts` | POST | `/signing-sessions` | `tabletSession` |
| `useRemoveTabletSession.ts` | DELETE | `/signing-sessions/{id}` | `tabletSession` |

### `src/hooks/data/index.ts` update
Comment out mock line, add api line (but keep mock as default for now — just prepare both lines).

## Key decisions
- Query hooks return `{ data, isLoading, error }` naturally from `useQuery` — signature-compatible
- Mutation hooks return `{ mutate, mutateAsync, isPending }` naturally from `useMutation` — signature-compatible
- `MockDataProvider` in api/ is a passthrough `({ children }) => <>{children}</>` so App.tsx doesn't need changes when switching
- No changes to any component files — they already import from `@/hooks/data`
- `hooks/data/index.ts` stays on mock export by default; switching is one line change

## File count
~30 new files in `src/hooks/api/`, 1 edit to `src/hooks/data/index.ts`.

