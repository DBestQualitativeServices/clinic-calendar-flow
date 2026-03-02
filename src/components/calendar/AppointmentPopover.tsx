import React, { useState } from 'react';
import type { Appointment, AppointmentStatus } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useUIState } from '@/store/uiStore';
import { usePatientById, useUpdateAppointmentStatus, useCheckinAppointment, useCancelAppointment } from '@/hooks/data';
import { formatPatientName } from '@/lib/calendar-utils';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Eye, LogIn, Play, RotateCcw, X, CheckCircle, AlertTriangle } from 'lucide-react';
import FinalizationModal from '@/components/modals/FinalizationModal';
import FormsStatusBadge from '@/components/forms/FormsStatusBadge';

const statusBadge: Record<string, { label: string; cls: string }> = {
  programat: { label: 'Programat', cls: 'bg-status-programat text-white' },
  sosit: { label: 'Sosit', cls: 'bg-status-sosit text-white' },
  in_consult: { label: 'În consult', cls: 'bg-status-in-consult text-white' },
  finalizat: { label: 'Finalizat', cls: 'bg-status-finalizat text-foreground' },
  anulat: { label: 'Anulat', cls: 'bg-status-anulat text-foreground' },
  no_show: { label: 'No-show', cls: 'bg-status-no-show text-white' },
};

interface AppointmentPopoverProps {
  appointment: Appointment;
  children: React.ReactNode;
}

export default function AppointmentPopover({ appointment, children }: AppointmentPopoverProps) {
  const { setActivePanel } = useUIState();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: checkin } = useCheckinAppointment();
  const { mutate: cancel } = useCancelAppointment();
  const [open, setOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);

  const apt = appointment;
  const badge = statusBadge[apt.status];
  const { data: patient } = usePatientById(apt.patients[0]?.patientId);
  const patientName = patient ? formatPatientName(patient) : 'Necunoscut';
  const isIncomplete = patient?.isIncomplete;

  const handleCheckIn = () => {
    checkin({ appointmentId: apt.id });
    setOpen(false);
    toast({ title: 'Pacientul a fost înregistrat ca sosit' });
    if (isIncomplete) {
      setTimeout(() => {
        setActivePanel({ type: 'patientForm', patientId: patient?.id });
      }, 300);
    }
  };

  const handleForceInConsult = () => {
    updateStatus({
      appointmentId: apt.id,
      update: {
        status: 'in_consult',
        timeline: [...apt.timeline, { timestamp: new Date().toISOString(), action: 'In consult (manual)', actor: 'Recepție' }],
      },
    });
    setOpen(false);
    toast({ title: 'Statusul a fost schimbat în "În consult"' });
  };

  const handleFinalize = () => {
    setOpen(false);
    setFinalizeModalOpen(true);
  };

  const handleCancel = () => {
    cancel({ appointmentId: apt.id });
    toast({ title: 'Programarea a fost anulată' });
    setCancelDialogOpen(false);
  };

  const handleReschedule = () => {
    setOpen(false);
    setActivePanel({ type: 'booking', prefill: { appointment: apt } });
  };

  const handleDetails = () => {
    setOpen(false);
    setActivePanel({ type: 'details', appointmentId: apt.id });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-60 p-3" align="start" side="right">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground truncate">{patientName}</span>
            <div className="flex items-center gap-1.5">
              <FormsStatusBadge appointmentId={apt.id} />
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', badge.cls)}>
                {badge.label}
              </span>
            </div>
          </div>

          {apt.status === 'sosit' && isIncomplete && (
            <button
              onClick={() => { setOpen(false); setActivePanel({ type: 'patientForm', patientId: patient?.id }); }}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 mb-2 rounded bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Date pacient incomplete — Completează acum
            </button>
          )}

          <div className="flex flex-col gap-0.5">
            <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8" onClick={handleDetails}>
              <Eye className="h-3.5 w-3.5" /> Detalii
            </Button>

            {apt.status === 'programat' && (
              <>
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8 text-status-sosit hover:text-status-sosit" onClick={handleCheckIn}>
                  <LogIn className="h-3.5 w-3.5" /> Check-in (Sosit)
                </Button>
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8" onClick={handleReschedule}>
                  <RotateCcw className="h-3.5 w-3.5" /> Reprogramează
                </Button>
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8 text-destructive hover:text-destructive" onClick={() => setCancelDialogOpen(true)}>
                  <X className="h-3.5 w-3.5" /> Anulează
                </Button>
              </>
            )}

            {apt.status === 'sosit' && (
              <>
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8" onClick={handleForceInConsult}>
                  <Play className="h-3.5 w-3.5" /> Forțează "În consult"
                </Button>
                <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8 text-destructive hover:text-destructive" onClick={() => setCancelDialogOpen(true)}>
                  <X className="h-3.5 w-3.5" /> Anulează
                </Button>
              </>
            )}

            {apt.status === 'in_consult' && (
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8 text-status-in-consult" onClick={handleFinalize}>
                <CheckCircle className="h-3.5 w-3.5" /> Finalizează
              </Button>
            )}

            {apt.status === 'no_show' && (
              <Button variant="ghost" size="sm" className="justify-start gap-2 text-xs h-8" onClick={handleReschedule}>
                <RotateCcw className="h-3.5 w-3.5" /> Reprogramează
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anulare programare</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să anulezi programarea pentru {patientName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nu, păstrează</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Da, anulează
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FinalizationModal
        appointmentId={apt.id}
        open={finalizeModalOpen}
        onOpenChange={setFinalizeModalOpen}
      />
    </>
  );
}
