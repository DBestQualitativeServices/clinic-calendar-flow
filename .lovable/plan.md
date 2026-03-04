## Fix: Align `Slot` type in API's `useAvailableSlots`

**Root cause**: `tsconfig.json` maps `@/hooks/data` → `src/hooks/api/`. The API's `useAvailableSlots.ts` exports a `Slot` type with only `{ time, available }`, but `BookingPanel` expects `{ date, time, doctorId, doctorName }` (the mock's `AvailableSlot` shape). TypeScript checks against the API types even though Vite resolves to mock at runtime.

**Fix**: Update `src/hooks/api/queries/useAvailableSlots.ts` to use the same `AvailableSlot` interface shape as the mock version (`date`, `time`, `doctorId`, `doctorName`). Remove the `available` field since it's not used anywhere. This keeps both layers symmetrical.

### Changes

`**src/hooks/api/queries/useAvailableSlots.ts**` — Replace the `Slot` interface with:

```ts
export interface AvailableSlot {
  date: string;
  time: string;
  doctorId: string;
  doctorName: string;
}
```

Update all references from `Slot` to `AvailableSlot` (`EMPTY`, query return type, etc.).

`**src/hooks/api/index.tsx**` — Verify `useAvailableSlots` is exported (it already is). No changes expected.

Single file edit, no component changes needed.  
  
  
Fix: Align Slot type in API's useAvailableSlots

Root cause: tsconfig.json maps @/hooks/data → src/hooks/api/. The API's useAvailableSlots.ts exports a Slot type with only { time, available }, but BookingPanel expects { date, time, doctorId, doctorName } (the mock's AvailableSlot shape). TypeScript checks against the API types even though Vite resolves to mock at runtime.

Fix: Update src/hooks/api/queries/useAvailableSlots.ts to use the same AvailableSlot interface shape as the mock version (date, time, doctorId, doctorName). Remove the available field since it's not used anywhere. This keeps both layers symmetrical.

Changes

src/hooks/api/queries/useAvailableSlots.ts — Replace the Slot interface with:

export interface AvailableSlot {

  date: string;

  time: string;

  doctorId: string;

  doctorName: string;

}

Update all references from Slot to AvailableSlot (EMPTY, query return type, etc.).

src/hooks/api/index.tsx — Verify useAvailableSlots is exported (it already is). No changes expected.

Single file edit, no component changes needed.