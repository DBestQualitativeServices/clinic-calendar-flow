import { useMockData } from './mock/MockDataProvider';
import { useCreateTabletSession, useRemoveTabletSession } from './data';
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
  const { tabletSessions, patients } = useMockData();
  const { mutate: addSession } = useCreateTabletSession();
  const { mutate: removeSession } = useRemoveTabletSession();

  const session: TabletSession | undefined = tabletSessions.find(
    s => s.appointmentId === appointmentId && s.patientId === patientId && s.active
  );

  const generate = () => {
    const patient = patients.find(p => p.id === patientId);
    const code = patient?.cnp ? patient.cnp.slice(-4) : String(Math.floor(1000 + Math.random() * 9000));
    addSession({ accessCode: code, appointmentId, patientId, active: true, createdAt: new Date().toISOString() });
    toast({ title: `Cod generat: ${code}` });
    return code;
  };

  const regenerate = () => {
    if (session) removeSession(session.accessCode);
    return generate();
  };

  return { session, generate, regenerate };
}
