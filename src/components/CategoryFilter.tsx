import React, { useState, useRef, useEffect } from 'react';
import { Category, Priority } from '../types';
import { Plus, ChevronDown, Check } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  selectedPriority: Priority | null;
  onSelectCategory: (id: string | null) => void;
  onSelectPriority: (priority: Priority | null) => void;
  onOpenNewCategory: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategoryId,
  selectedPriority,
  onSelectCategory,
  onSelectPriority,
  onOpenNewCategory,
}) => {
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera o pulsar Escape
  useEffect(() => {
    if (!isPriorityOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPriorityOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPriorityOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPriorityOpen]);

  return (
    <div className="flex items-center gap-2 mb-6 select-none">
      {/* 1. Selector desplegable de Prioridad (a la izquierda de Todo) */}
      <div ref={dropdownRef} className="relative flex-none">
        <button
          type="button"
          aria-expanded={isPriorityOpen}
          aria-haspopup="true"
          onClick={() => setIsPriorityOpen(!isPriorityOpen)}
          className={`flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13.5px] transition-all border cursor-pointer ${
            selectedPriority !== null
              ? 'bg-calma-surface text-calma-ink border-calma-accent shadow-calma font-medium'
              : 'text-calma-muted border-calma-line hover:text-calma-ink bg-transparent hover:bg-calma-surface/60'
          }`}
          title="Filtrar tareas por prioridad"
        >
          {selectedPriority ? (
            <>
              <span
                className="w-2 h-2 rounded-full flex-none"
                style={{
                  backgroundColor:
                    selectedPriority === 'alta'
                      ? '#B8707A'
                      : selectedPriority === 'media'
                      ? '#C2A266'
                      : '#8FAE8B',
                }}
              />
              <span className="capitalize font-medium">{selectedPriority}</span>
            </>
          ) : (
            <span>Prioridad</span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              isPriorityOpen ? 'rotate-180 text-calma-ink' : 'text-calma-muted'
            }`}
          />
        </button>

        {/* Menú flotante sereno para seleccionar prioridad */}
        {isPriorityOpen && (
          <div
            className="absolute top-full left-0 mt-1.5 w-44 bg-calma-surface rounded-2xl p-1.5 border border-calma-line shadow-2xl z-50 animate-page-popup space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Opción: Todas */}
            <button
              type="button"
              onClick={() => {
                onSelectPriority(null);
                setIsPriorityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
            >
              <span className={selectedPriority === null ? 'font-medium' : ''}>
                Todas
              </span>
              {selectedPriority === null && (
                <Check className="w-3.5 h-3.5 text-calma-accent" />
              )}
            </button>

            <div className="h-[1px] bg-calma-line/60 mx-1.5 my-1" />

            {/* Opción: Alta */}
            <button
              type="button"
              onClick={() => {
                onSelectPriority(selectedPriority === 'alta' ? null : 'alta');
                setIsPriorityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: '#B8707A' }} />
                <span className={selectedPriority === 'alta' ? 'font-medium text-calma-ink' : ''}>
                  Alta
                </span>
              </div>
              {selectedPriority === 'alta' && (
                <Check className="w-3.5 h-3.5 text-calma-accent" />
              )}
            </button>

            {/* Opción: Media */}
            <button
              type="button"
              onClick={() => {
                onSelectPriority(selectedPriority === 'media' ? null : 'media');
                setIsPriorityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: '#C2A266' }} />
                <span className={selectedPriority === 'media' ? 'font-medium text-calma-ink' : ''}>
                  Media
                </span>
              </div>
              {selectedPriority === 'media' && (
                <Check className="w-3.5 h-3.5 text-calma-accent" />
              )}
            </button>

            {/* Opción: Baja */}
            <button
              type="button"
              onClick={() => {
                onSelectPriority(selectedPriority === 'baja' ? null : 'baja');
                setIsPriorityOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] text-calma-ink hover:bg-calma-bg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: '#8FAE8B' }} />
                <span className={selectedPriority === 'baja' ? 'font-medium text-calma-ink' : ''}>
                  Baja
                </span>
              </div>
              {selectedPriority === 'baja' && (
                <Check className="w-3.5 h-3.5 text-calma-accent" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Separador vertical sutil entre Prioridad y Categorías */}
      <div className="w-[1px] h-4 bg-calma-line flex-none" />

      {/* 2. Lista horizontal deslizable de Categorías */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {/* Opción Todo */}
        <button
          type="button"
          aria-pressed={selectedCategoryId === null}
          onClick={() => onSelectCategory(null)}
          className={`flex-none inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] transition-all border cursor-pointer ${
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
              className={`flex-none inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[14px] transition-all border cursor-pointer ${
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
          className="flex-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] text-calma-muted hover:text-calma-ink border border-dashed border-calma-line hover:border-calma-muted transition-colors cursor-pointer"
          title="Crear nueva categoría"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva</span>
        </button>
      </div>
    </div>
  );
};
