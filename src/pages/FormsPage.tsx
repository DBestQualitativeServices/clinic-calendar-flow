import React, { useMemo } from 'react';
import { usePatients, useFormTemplates, useCompletedForms } from '@/hooks/data';
import { useUIState } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Eye } from 'lucide-react';

type FilterType = 'all' | 'valid' | 'expired';

export default function FormsPage() {
  const [filter, setFilter] = React.useState<FilterType>('all');
  const { searchQuery, setActivePanel } = useUIState();

  const { data: allPatients } = usePatients();
  const { data: formTemplates } = useFormTemplates();
  const { data: allForms } = useCompletedForms(''); // all forms

  const now = new Date().toISOString();
  const query = searchQuery.toLowerCase().trim();

  // Build enriched list: each form + patient + template info
  const enrichedForms = useMemo(() => {
    return allForms.map(f => {
      const patient = allPatients.find(p => p.id === f.patientId);
      const template = formTemplates.find(t => t.id === f.formTemplateId);
      return { ...f, patient, template };
    }).sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  }, [allForms, allPatients, formTemplates]);

  // Filter by search (patient name or form/template name)
  const searchedForms = useMemo(() => {
    if (!query) return enrichedForms;
    return enrichedForms.filter(f => {
      const patientName = f.patient
        ? `${f.patient.lastName} ${f.patient.firstName}`.toLowerCase()
        : '';
      const patientNameRev = f.patient
        ? `${f.patient.firstName} ${f.patient.lastName}`.toLowerCase()
        : '';
      const templateName = f.template?.title.toLowerCase() || '';
      return patientName.includes(query) || patientNameRev.includes(query) || templateName.includes(query);
    });
  }, [enrichedForms, query]);

  // Filter by validity
  const filteredForms = useMemo(() => {
    if (filter === 'all') return searchedForms;
    if (filter === 'valid') return searchedForms.filter(f => f.expiresAt > now);
    return searchedForms.filter(f => f.expiresAt <= now);
  }, [searchedForms, filter, now]);

  const openForm = (formId: string, patientId: string) => {
    setActivePanel({ type: 'formViewer', formId, patientId });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold">Formulare medicale</h1>
          <div className="flex gap-1 ml-auto">
            {(['all', 'valid', 'expired'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `Toate (${searchedForms.length})` : f === 'valid' ? 'Valide' : 'Expirate'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredForms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">
              {query ? 'Niciun formular găsit pentru căutarea curentă.' : 'Niciun formular în arhivă.'}
            </p>
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Pacient</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Formular</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Data completare</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Expiră la</th>
                  <th className="px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map(f => {
                  const isValid = f.expiresAt > now;
                  return (
                    <tr
                      key={f.id}
                      className="border-t border-border transition-colors hover:bg-muted/30 cursor-pointer"
                      onClick={() => openForm(f.id, f.patientId)}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {f.patient ? `${f.patient.lastName} ${f.patient.firstName}` : f.patientId}
                      </td>
                      <td className="px-4 py-2.5">{f.template?.title || f.formTemplateId}</td>
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
      </div>
    </div>
  );
}