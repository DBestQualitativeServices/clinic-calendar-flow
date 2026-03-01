import { categories } from '@/data/mock';

export function useCategories() {
  return { data: categories, isLoading: false, error: null };
}
