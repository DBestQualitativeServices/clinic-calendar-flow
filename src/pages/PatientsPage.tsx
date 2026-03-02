import React, { useState, useMemo } from 'react';
import { usePatients, useCompletedForms } from '@/hooks/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Users, Phone, Calendar, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import type { Patient, CompletedForm } from '@/types';

type FilterType = 'all' | 'incomplete' | 'with_forms' | 'no_forms';

function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function PatientRow({ patient, formCount, hasValidForms }: { patient: Patient; formCount: number; hasValidForms: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <tr
      className={cn(
        'border-t border-border cursor-pointer transition-colors hover:bg-muted/40',
        patient.isIncomplete && 'bg-destructive/5'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {patient.lastName[0]}{patient.firstName[0]}
          </div>
          <div>
            <span className="font-medium">{patient.lastName} {patient.firstName}</span>
            {patient.isIncomplete && (
              <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Incomplet
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          {patient.phone}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(patient.dateOfBirth).toLocaleDateString('ro-RO')}
          <span className="text-xs opacity-60">({getAge(patient.dateOfBirth)} ani)</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {formCount > 0 ? (
          <Badge variant="secondary" className="text-[10px] font-bold gap-1">
            <FileText className="h-3 w-3" />
            {formCount} {hasValidForms ? '✓' : ''}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
      </td>
    </tr>
  );
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Get all patients (pass search only if 2+ chars)
  const { data: allPatients } = usePatients(searchQuery.length >= 2 ? searchQuery : undefined);
  const { data: allForms } = useCompletedForms('');

  const now = new Date().toISOString();

  // Build form counts per patient
  const formsByPatient = useMemo(() => {
    const map = new Map<string, { total: number; valid: number }>();
    for (const f of allForms) {
      const entry = map.get(f.patientId) || { total: 0, valid: 0 };
      entry.total++;
      if (f.expiresAt > now) entry.valid++;
      map.set(f.patientId, entry);
    }
    return map;
  }, [allForms, now]);

  // Apply filters
  const filteredPatients = useMemo(() => {
    let list = searchQuery.length >= 2 ? allPatients : allPatients;

    switch (filter) {
      case 'incomplete':
        return list.filter(p => p.isIncomplete);
      case 'with_forms':
        return list.filter(p => (formsByPatient.get(p.id)?.total || 0) > 0);
      case 'no_forms':
        return list.filter(p => !formsByPatient.get(p.id)?.total);
      default:
        return list;
    }
  }, [allPatients, filter, formsByPatient, searchQuery]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Toți (${allPatients.length})` },
    { key: 'incomplete', label: 'Date incomplete' },
    { key: 'with_forms', label: 'Cu formulare' },
    { key: 'no_forms', label: 'Fără formulare' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Pacienți</h1>
          <Badge variant="outline" className="ml-auto text-xs">
            {filteredPatients.length} pacienți
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută pacient (nume, telefon, CNP)..."
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {filters.map(f => (
              <Button
                key={f.key}
                variant={filter === f.key ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Niciun pacient găsit.</p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Pacient</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Telefon</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Data nașterii</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Formulare</th>
                  <th className="px-4 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(p => {
                  const fc = formsByPatient.get(p.id);
                  return (
                    <PatientRow
                      key={p.id}
                      patient={p}
                      formCount={fc?.total || 0}
                      hasValidForms={(fc?.valid || 0) > 0}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
