import React from 'react';
import { Category } from '../types';
import { Plus } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onOpenNewCategory: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onOpenNewCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Opción Todas */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
          selectedCategoryId === null
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        Todas
      </button>

      {/* Lista de categorías */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              isSelected
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span>{cat.name}</span>
          </button>
        );
      })}

      {/* Botón para crear nueva categoría */}
      <button
        onClick={onOpenNewCategory}
        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-dashed border-slate-200 dark:border-slate-700"
        title="Crear nueva categoría"
      >
        <Plus className="w-3 h-3" />
        <span>Nueva</span>
      </button>
    </div>
  );
};
