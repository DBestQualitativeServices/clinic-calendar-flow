import React, { useState, useMemo } from 'react';
import { usePatients, useFormTemplates, useCompletedForms } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Eye } from 'lucide-react';

type FilterType = 'all' | 'valid' | 'expired';

export default function FormsPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const { searchQuery, setActivePanel } = useUIState();

  const { data: searchResults } = usePatients(searchQuery.length >= 2 ? searchQuery : undefined);
  const filteredSearchResults = useMemo(
    () => (searchQuery.length >= 2 && !selectedPatientId ? searchResults.slice(0, 8) : []),
    [searchResults, searchQuery, selectedPatientId]
  );

  const { data: formTemplates } = useFormTemplates();
  const { data: patientForms } = useCompletedForms(selectedPatientId || '');

  const now = new Date().toISOString();

  const sortedForms = useMemo(
    () => [...patientForms].sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [patientForms]
  );

  const filteredForms = useMemo(() => {
    if (filter === 'all') return sortedForms;
    if (filter === 'valid') return sortedForms.filter(f => f.expiresAt > now);
    return sortedForms.filter(f => f.expiresAt <= now);
  }, [sortedForms, filter, now]);

  const selectedPatient = searchResults.find(p => p.id === selectedPatientId);

  const openForm = (formId: string) => {
    if (selectedPatientId) {
      setActivePanel({ type: 'formViewer', formId, patientId: selectedPatientId });
    }
  };

  // Reset selection when search changes
  React.useEffect(() => {
    if (searchQuery.length < 2) setSelectedPatientId(null);
  }, [searchQuery]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Formulare medicale</h1>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Dropdown results from global search */}
        {filteredSearchResults.length > 0 && (
          <div className="border border-border rounded-md bg-popover shadow-lg overflow-hidden max-w-md">
            <p className="px-4 py-2 text-xs text-muted-foreground border-b border-border">Selectează un pacient:</p>
            {filteredSearchResults.map(p => (
              <button
                key={p.id}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
                onClick={() => setSelectedPatientId(p.id)}
              >
                <span className="font-medium">{p.lastName} {p.firstName}</span>
                <span className="text-muted-foreground ml-2">{p.phone}</span>
                {p.cnp && <span className="text-muted-foreground ml-2 text-xs">CNP: {p.cnp}</span>}
              </button>
            ))}
          </div>
        )}

        {!selectedPatientId && filteredSearchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Caută un pacient în bara de sus pentru a vedea formularele</p>
          </div>
        )}

        {selectedPatientId && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Formulare pentru <span className="font-bold">{selectedPatient?.lastName} {selectedPatient?.firstName}</span>
                {selectedPatient?.cnp && <span className="text-muted-foreground ml-2 text-xs">CNP: {selectedPatient.cnp}</span>}
              </p>
              <div className="flex gap-1">
                {(['all', 'valid', 'expired'] as const).map(f => (
                  <Button
                    key={f}
                    variant={filter === f ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? `Toate (${sortedForms.length})` : f === 'valid' ? 'Valide' : 'Expirate'}
                  </Button>
                ))}
              </div>
            </div>

            {filteredForms.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Niciun formular găsit.</p>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Formular</th>
                      <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Data completare</th>
                      <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Expiră la</th>
                      <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-2 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredForms.map(f => {
                      const template = formTemplates.find(t => t.id === f.formTemplateId);
                      const isValid = f.expiresAt > now;
                      return (
                        <tr
                          key={f.id}
                          className="border-t border-border transition-colors hover:bg-muted/30 cursor-pointer"
                          onClick={() => openForm(f.id)}
                        >
                          <td className="px-4 py-2.5 font-medium">{template?.title || f.formTemplateId}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{new Date(f.completedAt).toLocaleDateString('ro-RO')}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{new Date(f.expiresAt).toLocaleDateString('ro-RO')}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              isValid ? 'bg-emerald-500/20 text-emerald-700' : 'bg-muted text-muted-foreground',
                            )}>
                              {isValid ? 'Valid' : 'Expirat'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                              <Eye className="h-3.5 w-3.5" /> Vezi
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}