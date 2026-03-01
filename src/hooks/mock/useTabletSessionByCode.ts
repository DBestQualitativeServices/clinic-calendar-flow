import { useMemo } from 'react';
import { useMockData } from './MockDataProvider';
import { consultationTypes, consultFormRequirements } from '@/data/mock';

function getConsultationName(typeId: string): string {
  return consultationTypes.find(c => c.id === typeId)?.name ?? typeId;
}

export function useTabletSessionByCode(code: string) {
  const { tabletSessions, appointments, patients, completedForms } = useMockData();

  const data = useMemo(() => {
    const session = tabletSessions.find(s => s.accessCode === code && s.active);
    if (!session) return undefined;

    const appointment = appointments.find(a => a.id === session.appointmentId);
    const patient = patients.find(p => p.id === session.patientId);

    // Compute pending forms
    const now = new Date().toISOString();
    const ap = appointment?.patients.find(p => p.patientId === session.patientId);
    const requiredSet = new Set<string>();
    ap?.consultations.forEach(c => {
      const name = getConsultationName(c.consultationTypeId);
      (consultFormRequirements[name] || []).forEach(id => requiredSet.add(id));
    });
    const requiredTemplateIds = [...requiredSet];

    const pendingForms = requiredTemplateIds.filter(tid => {
      const latest = completedForms
        .filter(f => f.patientId === session.patientId && f.formTemplateId === tid)
        .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
      return !latest || latest.expiresAt <= now;
    });

    const completedFormIds = requiredTemplateIds.filter(tid => !pendingForms.includes(tid));

    return { session, appointment, patient, pendingForms, completedFormIds, requiredTemplateIds };
  }, [tabletSessions, appointments, patients, completedForms, code]);

  return { data, isLoading: false, error: null };
}
