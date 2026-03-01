import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTabletSessionByCode, useDoctors, useFormTemplates } from '@/hooks/mock';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check, LogOut, RefreshCw } from 'lucide-react';

export default function TabletFormsList() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const navigate = useNavigate();
  const { data: sessionData } = useTabletSessionByCode(code);
  const { data: doctors } = useDoctors();
  const { data: formTemplates } = useFormTemplates();

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700 mb-4">Sesiune invalidă</p>
          <Button onClick={() => navigate('/tablet')} className="h-14 text-lg rounded-xl">Înapoi</Button>
        </div>
      </div>
    );
  }

  const { session, appointment, patient, pendingForms, completedFormIds } = sessionData;
  const doctor = appointment ? doctors.find(d => d.id === appointment.doctorId) : null;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Bună, {patient?.firstName || 'Pacient'}
          </h1>
          {appointment && doctor && (
            <p className="text-base text-slate-500 mt-1">
              Programare la {doctor.name}, {appointment.date}
            </p>
          )}
        </div>
        <Button variant="outline" className="h-12 text-base gap-2 rounded-xl" onClick={() => navigate('/tablet')}>
          <LogOut className="h-4 w-4" /> Ieșire
        </Button>
      </div>

      {pendingForms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">De completat</h2>
          <div className="space-y-3">
            {pendingForms.map(tid => {
              const template = formTemplates.find(t => t.id === tid);
              if (!template) return null;
              return (
                <button
                  key={tid}
                  onClick={() => navigate(`/tablet/form/${tid}?code=${code}`)}
                  className="w-full flex items-center justify-between p-5 bg-white rounded-xl border-l-4 border-l-amber-400 border border-border shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-800">{template.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{template.questions.length} întrebări</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {completedFormIds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Completate</h2>
          <div className="space-y-3">
            {completedFormIds.map(tid => {
              const template = formTemplates.find(t => t.id === tid);
              if (!template) return null;
              return (
                <div key={tid} className="flex items-center justify-between p-5 bg-slate-100 rounded-xl border border-border">
                  <div>
                    <p className="text-base font-medium text-slate-600">{template.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">Completat ✓</p>
                  </div>
                  <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingForms.length === 0 && completedFormIds.length > 0 && (
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-emerald-600">Toate formularele sunt completate!</p>
          <p className="text-base text-slate-500 mt-1">Vă mulțumim.</p>
        </div>
      )}

      <div className="mt-auto pt-6">
        <Button
          variant="outline"
          className="w-full h-14 text-base rounded-xl gap-2"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" /> Verifică formulare noi
        </Button>
      </div>
    </div>
  );
}
