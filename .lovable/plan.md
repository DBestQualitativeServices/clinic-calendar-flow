

# Plan: Enrich Mock Completed Forms

## Problem
The `/forms` page works but requires searching for a patient. The existing mock data only has completed forms for 4 out of 15 patients (p-1, p-3, p-5, p-9), making it hard to explore the interface.

## What changes

### `src/data/mock.ts` — Add more completed forms
Add completed forms for ~6 more patients covering diverse scenarios:

| Patient | Forms | Scenario |
|---------|-------|----------|
| p-2 (Ana Popa) | ft1 valid, ft4 expired | Partial — 1 valid, 1 expired |
| p-4 (Elena Stoica) | ft1 valid, ft3 valid, ft4 valid | All valid (Dermatoscopie + extra) |
| p-6 (Maria Florescu) | None | Zero forms — tests empty state |
| p-8 (Daniela Neagu) | ft1 expired | Only expired forms |
| p-10 (Simona Tudor) | ft1 valid, ft2 valid, ft4 valid | All Botox forms valid |
| p-11 (Florin Georgescu) | ft1 valid | Just GDPR |
| p-12 (Roxana Lazar) | ft1 valid, ft3 valid, ft4 valid, ft5 valid | Many forms, all valid |
| p-14 (Andreea Matei) | ft1 valid, ft2 expired, ft4 valid | Mix valid + expired |

This gives 8+ more `CompletedForm` entries in `initialCompletedForms`, using realistic dates. The intersecting logic already works — same ft1 (GDPR) counts for all consultations that need it.

### No other files change
The `FormsPage`, `useCompletedForms`, and `useFormsStatus` hooks already handle everything correctly. Richer mock data is all that's needed.

