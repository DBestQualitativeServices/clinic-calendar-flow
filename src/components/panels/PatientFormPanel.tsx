import React, { useState } from 'react';
import { useUIState } from '@/store/uiStore';
import { usePatientById, useUpdatePatient } from '@/hooks/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface PatientFormPanelProps {
  patientId?: string;
  onComplete?: () => void;
}

function validateCNP(cnp: string): boolean {
  if (!cnp) return true;
  return /^\d{13}$/.test(cnp);
}

function validatePhone(phone: string): boolean {
  return /^0[0-9]{9}$/.test(phone);
}

export default function PatientFormPanel({ patientId, onComplete }: PatientFormPanelProps) {
  const { setActivePanel } = useUIState();
  const { data: existing } = usePatientById(patientId || '');
  const { mutate: updatePatient } = useUpdatePatient();

  const [form, setForm] = useState({
    lastName: existing?.lastName || '',
    firstName: existing?.firstName || '',
    cnp: existing?.cnp || '',
    dateOfBirth: existing?.dateOfBirth || '',
    phone: existing?.phone || '',
    email: existing?.email || '',
    address: existing?.address || '',
    medicalNotes: existing?.medicalNotes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!form.lastName.trim()) newErrors.lastName = 'Numele este obligatoriu';
    if (!form.firstName.trim()) newErrors.firstName = 'Prenumele este obligatoriu';
    if (!form.phone.trim()) newErrors.phone = 'Telefonul este obligatoriu';
    else if (!validatePhone(form.phone)) newErrors.phone = 'Format: 07XXXXXXXX';
    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Data nașterii este obligatorie';
    if (form.cnp && !validateCNP(form.cnp)) newErrors.cnp = 'CNP: 13 cifre';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (patientId) {
      updatePatient({
        patientId,
        updates: { ...form, isIncomplete: false },
      });
    }

    toast({ title: 'Datele pacientului au fost salvate!' });
    onComplete?.();
    setActivePanel({ type: 'none' });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nume *</Label>
          <Input className="h-8 text-sm" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
          {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Prenume *</Label>
          <Input className="h-8 text-sm" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
          {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">CNP</Label>
        <Input className="h-8 text-sm" value={form.cnp} onChange={e => update('cnp', e.target.value)} maxLength={13} placeholder="Opțional" />
        {errors.cnp && <p className="text-[10px] text-destructive">{errors.cnp}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Data nașterii *</Label>
        <Input type="date" className="h-8 text-sm" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} />
        {errors.dateOfBirth && <p className="text-[10px] text-destructive">{errors.dateOfBirth}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Telefon *</Label>
        <Input className="h-8 text-sm" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="07XXXXXXXX" />
        {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Email</Label>
        <Input type="email" className="h-8 text-sm" value={form.email} onChange={e => update('email', e.target.value)} placeholder="Opțional" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Adresă</Label>
        <Input className="h-8 text-sm" value={form.address} onChange={e => update('address', e.target.value)} placeholder="Opțional" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Note medicale</Label>
        <Textarea className="text-sm min-h-[80px]" value={form.medicalNotes} onChange={e => update('medicalNotes', e.target.value)} placeholder="Alergii, condiții, tratamente..." />
      </div>

      <Button className="w-full gap-2" onClick={handleSave}>
        <Save className="h-4 w-4" /> Salvează datele pacientului
      </Button>
    </div>
  );
}
