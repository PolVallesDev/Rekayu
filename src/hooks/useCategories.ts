import { useState, useCallback } from 'react';
import { Category } from '../types';
import { getCategories, saveCategories, deleteCategoryFromStorage } from '../lib/storage';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(() => getCategories());

  // Añadir una nueva categoría
  const addCategory = useCallback((name: string, color: string): Category => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color: color.trim() || '#3B82F6',
      isDefault: false,
    };

    const updated = [...categories, newCategory];
    saveCategories(updated);
    setCategories(updated);
    return newCategory;
  }, [categories]);

  // Eliminar una categoría
  const deleteCategory = useCallback((id: string): boolean => {
    if (categories.length <= 1) {
      return false;
    }
    deleteCategoryFromStorage(id);
    setCategories(getCategories());
    return true;
  }, [categories.length]);

  // Recargar categorías (por ejemplo tras importar JSON)
  const refreshCategories = useCallback(() => {
    setCategories(getCategories());
  }, []);

  return {
    categories,
    addCategory,
    deleteCategory,
    refreshCategories,
  };
};
