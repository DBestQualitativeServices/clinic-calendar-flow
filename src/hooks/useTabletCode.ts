import { useTabletSession, useCreateTabletSession, useRemoveTabletSession, usePatientById } from '@/hooks/data';
import { toast } from '@/hooks/use-toast';
import type { TabletSession } from '@/types';

/**
 * Shared hook for tablet session management.
 * Encapsulates:
 *  - looking up the active session for a given appointment+patient
 *  - generating a new access code (last 4 of CNP or random 4-digit)
 *  - regenerating (remove old + generate new)
 *
 * Used by: AppointmentDetailsPanel (PatientHeader), FormsStatusPanel, FinalizationModal.
 */
export function useTabletCode(appointmentId: string, patientId: string) {
  const { data: session } = useTabletSession(appointmentId);
  const { data: patient } = usePatientById(patientId);
  const { mutate: addSession } = useCreateTabletSession();
  const { mutate: removeSession } = useRemoveTabletSession();

  const activeSession: TabletSession | undefined =
    session && session.patientId === patientId && session.active ? session : undefined;

  const generate = () => {
    const code = patient?.cnp ? patient.cnp.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
    addSession({ accessCode: code, appointmentId, patientId, active: true, createdAt: new Date().toISOString() });
    toast({ title: `Cod generat: ${code}` });
    return code;
  };

  const regenerate = () => {
    if (activeSession) removeSession(activeSession.accessCode);
    return generate();
  };

  return { session: activeSession, generate, regenerate };
}
