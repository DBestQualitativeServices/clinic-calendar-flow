import React, { useState } from 'react';
import { useAppointmentById, usePatientById, useConsultationTypes } from '@/hooks/data';
import { formatPatientName } from '@/lib/calendar-utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CheckCircle, FileText } from 'lucide-react';
import SignatureCanvas from '@/components/tablet/SignatureCanvas';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConsultFormPanelProps {
  appointmentId: string;
}

export default function ConsultFormPanel({ appointmentId }: ConsultFormPanelProps) {
  const { data: apt } = useAppointmentById(appointmentId);
  const { data: patient } = usePatientById(apt?.patients[0]?.patientId ?? '');
  const { data: consultationTypes } = useConsultationTypes();

  const [isSanatos, setIsSanatos] = useState(false);
  const [isBarbat, setIsBarbat] = useState(false);
  const [observatii, setObservatii] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!apt) return <p className="text-sm text-muted-foreground">Programarea nu a fost găsită.</p>;

  const patientName = patient ? formatPatientName(patient) : 'Necunoscut';
  const consultNames = apt.patients[0]?.consultations.map(c => {
    const ct = consultationTypes.find(t => t.id === c.consultationTypeId);
    return ct?.name ?? '';
  }).filter(Boolean).join(', ');

  const handleSubmit = () => {
    if (!signature) {
      toast({ title: 'Semnătura lipsește', description: 'Vă rugăm să semnați înainte de a finaliza.', variant: 'destructive' });
      return;
    }
    setSubmitted(true);
    toast({ title: 'Scrisoare medicală completată', description: `Formular salvat pentru ${patientName}` });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-foreground">Scrisoare medicală completată</p>
        <p className="text-xs text-muted-foreground text-center">
          Formularul a fost salvat cu succes pentru {patientName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="p-3 rounded-md bg-accent/50 border border-border space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">Scrisoare medicală</span>
        </div>
        <p className="text-xs text-muted-foreground">Pacient: {patientName}</p>
        {consultNames && <p className="text-xs text-muted-foreground">Consultație: {consultNames}</p>}
      </div>

      {/* Question 1 */}
      <div className="p-3 rounded-md border border-border space-y-2">
        <Label className="text-sm font-medium">
          1. Este pacientul sănătos?
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Switch checked={isSanatos} onCheckedChange={setIsSanatos} />
          <span className={cn("text-sm font-medium", isSanatos ? "text-emerald-600" : "text-muted-foreground")}>
            {isSanatos ? 'Da' : 'Nu'}
          </span>
        </div>
      </div>

      {/* Question 2 */}
      <div className="p-3 rounded-md border border-border space-y-2">
        <Label className="text-sm font-medium">
          2. Este pacientul bărbat?
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <Switch checked={isBarbat} onCheckedChange={setIsBarbat} />
          <span className={cn("text-sm font-medium", isBarbat ? "text-primary" : "text-muted-foreground")}>
            {isBarbat ? 'Da' : 'Nu'}
          </span>
        </div>
      </div>

      {/* Question 3 */}
      <div className="p-3 rounded-md border border-border space-y-2">
        <Label className="text-sm font-medium">3. Observații</Label>
        <Textarea
          className="text-sm min-h-[80px]"
          placeholder="Notați observațiile clinice..."
          value={observatii}
          onChange={e => setObservatii(e.target.value)}
        />
      </div>

      {/* Question 4 — Signature */}
      <div className="p-3 rounded-md border border-border space-y-2">
        <Label className="text-sm font-medium">
          4. Semnătura doctor
          <span className="text-destructive ml-0.5">*</span>
        </Label>
        <SignatureCanvas label="" onSignatureChange={setSignature} />
      </div>

      {/* Submit */}
      <Button className="w-full gap-2" onClick={handleSubmit}>
        <CheckCircle className="h-4 w-4" />
        Salvează scrisoarea medicală
      </Button>
    </div>
  );
}
