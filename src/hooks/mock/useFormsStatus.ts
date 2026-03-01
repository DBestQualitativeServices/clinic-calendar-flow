import { useMemo, useCallback } from 'react';
import { useMockData } from './MockDataProvider';
import { consultationTypes, consultFormRequirements } from '@/data/mock';
import type { FormsStatus } from './types';

function getConsultationName(typeId: string): string {
  return consultationTypes.find(c => c.id === typeId)?.name ?? typeId;
}

export function useFormsStatusForPatient() {
  const { completedForms } = useMockData();

  return useCallback(
    (patientId: string, consultationTypeIds: string[]): FormsStatus => {
      const now = new Date().toISOString();
      const requiredSet = new Set<string>();
      consultationTypeIds.forEach(ctId => {
        const ctName = getConsultationName(ctId);
        const templateIds = consultFormRequirements[ctName] || [];
        templateIds.forEach(id => requiredSet.add(id));
      });
      const requiredTemplateIds = [...requiredSet];

      const completedTemplateIds: string[] = [];
      const expiredTemplateIds: string[] = [];
      const missingTemplateIds: string[] = [];

      requiredTemplateIds.forEach(tid => {
        const form = completedForms
          .filter(f => f.patientId === patientId && f.formTemplateId === tid)
          .sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
        if (form && form.expiresAt > now) {
          completedTemplateIds.push(tid);
        } else if (form && form.expiresAt <= now) {
          expiredTemplateIds.push(tid);
          missingTemplateIds.push(tid);
        } else {
          missingTemplateIds.push(tid);
        }
      });

      return {
        total: requiredTemplateIds.length,
        completed: completedTemplateIds.length,
        requiredTemplateIds,
        completedTemplateIds,
        missingTemplateIds,
        expiredTemplateIds,
      };
    },
    [completedForms]
  );
}

export function useFormsStatus(appointmentId: string) {
  const { appointments } = useMockData();
  const getFormsStatusForPatient = useFormsStatusForPatient();

  const data = useMemo((): FormsStatus => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { total: 0, completed: 0, requiredTemplateIds: [], completedTemplateIds: [], missingTemplateIds: [], expiredTemplateIds: [] };

    const totalRequired = new Set<string>();
    const totalCompleted = new Set<string>();
    const totalMissing = new Set<string>();
    const totalExpired = new Set<string>();

    apt.patients.forEach(ap => {
      const ctIds = ap.consultations.map(c => c.consultationTypeId);
      const status = getFormsStatusForPatient(ap.patientId, ctIds);
      status.requiredTemplateIds.forEach(id => totalRequired.add(`${ap.patientId}:${id}`));
      status.completedTemplateIds.forEach(id => totalCompleted.add(`${ap.patientId}:${id}`));
      status.missingTemplateIds.forEach(id => totalMissing.add(`${ap.patientId}:${id}`));
      status.expiredTemplateIds.forEach(id => totalExpired.add(`${ap.patientId}:${id}`));
    });

    return {
      total: totalRequired.size,
      completed: totalCompleted.size,
      requiredTemplateIds: [...totalRequired],
      completedTemplateIds: [...totalCompleted],
      missingTemplateIds: [...totalMissing],
      expiredTemplateIds: [...totalExpired],
    };
  }, [appointments, appointmentId, getFormsStatusForPatient]);

  return { data, isLoading: false, error: null };
}
