export interface FormsStatus {
  total: number;
  completed: number;
  requiredTemplateIds: string[];
  completedTemplateIds: string[];
  missingTemplateIds: string[];
  expiredTemplateIds: string[];
}
