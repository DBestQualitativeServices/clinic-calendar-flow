import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type { Appointment, TimeBlock, CalendarState, CompletedForm, TabletSession } from '@/types';
import { initialAppointments, initialTimeBlocks, initialCompletedForms, initialTabletSessions, consultationTypes, consultFormRequirements, formTemplates } from '@/data/mock';
import { getConsultationName } from '@/lib/calendar-utils';

// Panel types for shared slide-in container
export type PanelType = 
  | { type: 'none' }
  | { type: 'booking'; prefill?: { doctorId?: string; date?: string; startTime?: string; appointment?: Appointment } }
  | { type: 'details'; appointmentId: string }
  | { type: 'patientForm'; patientId?: string; onComplete?: () => void };

export interface FormsStatus {
  total: number;
  completed: number;
  requiredTemplateIds: string[];
  completedTemplateIds: string[];
  missingTemplateIds: string[];
  expiredTemplateIds: string[];
}

interface AppState {
  appointments: Appointment[];
  timeBlocks: TimeBlock[];
  calendar: CalendarState;
  activePanel: PanelType;
  completedForms: CompletedForm[];
  tabletSessions: TabletSession[];
  setCalendar: (update: Partial<CalendarState>) => void;
  updateAppointment: (id: string, update: Partial<Appointment>) => void;
  addAppointment: (apt: Appointment) => void;
  addTimeBlock: (tb: TimeBlock) => void;
  removeTimeBlock: (id: string) => void;
  setActivePanel: (panel: PanelType) => void;
  addCompletedForm: (form: CompletedForm) => void;
  addTabletSession: (session: TabletSession) => void;
  removeTabletSession: (code: string) => void;
  getFormsStatus: (appointmentId: string) => FormsStatus;
  getFormsStatusForPatient: (patientId: string, consultationTypeIds: string[]) => FormsStatus;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [calendar, setCalendarState] = useState<CalendarState>({
    viewMode: 'daily',
    selectedDate: new Date().toISOString().split('T')[0],
  });
  const [activePanel, setActivePanel] = useState<PanelType>({ type: 'none' });
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>(initialCompletedForms);
  const [tabletSessions, setTabletSessions] = useState<TabletSession[]>(initialTabletSessions);

  const setCalendar = useCallback((update: Partial<CalendarState>) => {
    setCalendarState(prev => ({ ...prev, ...update }));
  }, []);

  const updateAppointment = useCallback((id: string, update: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...update } : a));
  }, []);

  const addAppointment = useCallback((apt: Appointment) => {
    setAppointments(prev => [...prev, apt]);
  }, []);

  const addTimeBlock = useCallback((tb: TimeBlock) => {
    setTimeBlocks(prev => [...prev, tb]);
  }, []);

  const removeTimeBlock = useCallback((id: string) => {
    setTimeBlocks(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCompletedForm = useCallback((form: CompletedForm) => {
    setCompletedForms(prev => [...prev, form]);
  }, []);

  const addTabletSession = useCallback((session: TabletSession) => {
    setTabletSessions(prev => [...prev, session]);
  }, []);

  const removeTabletSession = useCallback((code: string) => {
    setTabletSessions(prev => prev.filter(s => s.accessCode !== code));
  }, []);

  const getFormsStatusForPatient = useCallback((patientId: string, consultationTypeIds: string[]): FormsStatus => {
    const now = new Date().toISOString();
    // Get required template IDs from consultation names
    const requiredSet = new Set<string>();
    consultationTypeIds.forEach(ctId => {
      const ctName = getConsultationName(ctId);
      const templateIds = consultFormRequirements[ctName] || [];
      templateIds.forEach(id => requiredSet.add(id));
    });
    const requiredTemplateIds = [...requiredSet];

    // Check which are completed and valid
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
  }, [completedForms]);

  const getFormsStatus = useCallback((appointmentId: string): FormsStatus => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return { total: 0, completed: 0, requiredTemplateIds: [], completedTemplateIds: [], missingTemplateIds: [], expiredTemplateIds: [] };

    // Aggregate across all patients
    let totalRequired = new Set<string>();
    let totalCompleted = new Set<string>();
    let totalMissing = new Set<string>();
    let totalExpired = new Set<string>();

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
  }, [appointments, getFormsStatusForPatient]);

  // Auto-transition: Sosit → In consult when current time >= startTime
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];
      
      setAppointments(prev => prev.map(apt => {
        if (apt.status === 'sosit' && apt.date === today && apt.startTime) {
          const [h, m] = apt.startTime.split(':').map(Number);
          const aptMinutes = h * 60 + m;
          if (nowMinutes >= aptMinutes) {
            return {
              ...apt,
              status: 'in_consult' as const,
              timeline: [...apt.timeline, { timestamp: now.toISOString(), action: 'In consult (auto)' }],
            };
          }
        }
        return apt;
      }));
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      appointments, timeBlocks, calendar, activePanel, completedForms, tabletSessions,
      setCalendar, updateAppointment, addAppointment, addTimeBlock, removeTimeBlock, setActivePanel,
      addCompletedForm, addTabletSession, removeTabletSession, getFormsStatus, getFormsStatusForPatient,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be inside AppProvider');
  return ctx;
}
