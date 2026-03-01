import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Appointment, TimeBlock, CompletedForm, TabletSession, Patient } from '@/types';
import {
  initialAppointments,
  initialTimeBlocks,
  initialCompletedForms,
  initialTabletSessions,
  patients as initialPatients,
} from '@/data/mock';

interface MockDataState {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  timeBlocks: TimeBlock[];
  setTimeBlocks: React.Dispatch<React.SetStateAction<TimeBlock[]>>;
  completedForms: CompletedForm[];
  setCompletedForms: React.Dispatch<React.SetStateAction<CompletedForm[]>>;
  tabletSessions: TabletSession[];
  setTabletSessions: React.Dispatch<React.SetStateAction<TabletSession[]>>;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const MockDataContext = createContext<MockDataState | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialTimeBlocks);
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>(initialCompletedForms);
  const [tabletSessions, setTabletSessions] = useState<TabletSession[]>(initialTabletSessions);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  // Auto-transition: Sosit → In consult when current time >= startTime
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];

      setAppointments(prev =>
        prev.map(apt => {
          if (apt.status === 'sosit' && apt.date === today && apt.startTime) {
            const [h, m] = apt.startTime.split(':').map(Number);
            const aptMinutes = h * 60 + m;
            if (nowMinutes >= aptMinutes) {
              return {
                ...apt,
                status: 'in_consult' as const,
                timeline: [
                  ...apt.timeline,
                  { timestamp: now.toISOString(), action: 'In consult (auto)' },
                ],
              };
            }
          }
          return apt;
        })
      );
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MockDataContext.Provider
      value={{
        appointments,
        setAppointments,
        timeBlocks,
        setTimeBlocks,
        completedForms,
        setCompletedForms,
        tabletSessions,
        setTabletSessions,
        patients,
        setPatients,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error('useMockData must be inside MockDataProvider');
  return ctx;
}
