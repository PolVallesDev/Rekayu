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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Opción Todo */}
      <button
        type="button"
        aria-pressed={selectedCategoryId === null}
        onClick={() => onSelectCategory(null)}
        className={`flex-none inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] transition-all border ${
          selectedCategoryId === null
            ? 'bg-calma-surface text-calma-ink border-calma-surface shadow-calma font-medium'
            : 'text-calma-muted border-calma-line hover:text-calma-ink'
        }`}
      >
        Todo
      </button>

      {/* Lista de categorías */}
      {categories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(isSelected ? null : cat.id)}
            className={`flex-none inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] transition-all border ${
              isSelected
                ? 'bg-calma-surface text-calma-ink border-calma-surface shadow-calma font-medium'
                : 'text-calma-muted border-calma-line hover:text-calma-ink'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-none"
              style={{ backgroundColor: cat.color }}
            />
            <span>{cat.name}</span>
          </button>
        );
      })}

      {/* Botón para crear nueva categoría */}
      <button
        type="button"
        onClick={onOpenNewCategory}
        className="flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-calma-muted hover:text-calma-ink border border-dashed border-calma-line hover:border-calma-muted transition-colors"
        title="Crear nueva categoría"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Nueva</span>
      </button>
    </div>
  );
};
