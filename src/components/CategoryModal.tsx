import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, color: string) => void;
}

const PRESET_COLORS = [
  '#7E9CB8', // Clase (Azul denim)
  '#B8707A', // Exámenes (Terracota / Rosa)
  '#C2A266', // Emprender (Bronce / Ámbar)
  '#8FAE8B', // Personal (Salvia)
  '#5F8F80', // Verde Calma
  '#6C8B93', // Océano grisáceo
  '#A0849D', // Lavanda suave
  '#C99378', // Arcilla
  '#7A8B7B', // Olivo
  '#9B8F80', // Tierra cálido
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#7E9CB8');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica un nombre para la categoría.');
      return;
    }

    onAddCategory(name.trim(), color);
    setName('');
    setColor('#7E9CB8');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-sm bg-calma-surface rounded-2xl p-6 shadow-2xl border border-calma-line animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-calma-line">
          <h2 className="text-lg font-serif font-normal text-calma-ink m-0">
            Nueva Categoría
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-calma-warn/10 border border-calma-warn text-calma-warn text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Nombre de la categoría */}
          <div>
            <label className="block text-[13px] font-medium text-calma-muted mb-1.5">
              Nombre *
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Tesis, Gimnasio, Finanzas..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-calma-line bg-calma-bg text-calma-ink text-[14.5px] focus:outline-none focus:ring-2 focus:ring-calma-accent transition-all placeholder:text-calma-muted"
            />
          </div>

          {/* Selector de color */}
          <div>
            <label className="block text-[13px] font-medium text-calma-muted mb-2">
              Color identificador
            </label>
            <div className="grid grid-cols-5 gap-2.5 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${
                    color.toLowerCase() === c.toLowerCase()
                      ? 'scale-110 ring-2 ring-offset-2 ring-calma-accent dark:ring-offset-calma-surface shadow-xs'
                      : 'hover:scale-105 opacity-85'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Selector de color personalizado */}
            <div className="flex items-center gap-2 pt-2 border-t border-calma-line">
              <span className="text-[12px] text-calma-muted">Personalizado:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
              />
              <span className="text-[12px] font-mono text-calma-muted">{color}</span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-calma-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-calma-muted hover:text-calma-ink rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-[13px] font-medium bg-calma-accent text-white rounded-xl hover:opacity-90 transition-all shadow-xs"
            >
              Crear categoría
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
