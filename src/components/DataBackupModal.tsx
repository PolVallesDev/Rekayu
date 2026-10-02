import React, { useRef, useState } from 'react';
import { exportAppDataAsJSON, importAppDataFromJSON } from '../lib/storage';
import { X, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      exportAppDataAsJSON();
      setFeedback({
        type: 'success',
        message: 'Copia de seguridad descargada correctamente en formato JSON.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Hubo un error al generar la copia de seguridad.',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setFeedback(null);

    const result = await importAppDataFromJSON(file);
    setLoading(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      onDataRestored();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-calma-surface rounded-2xl p-6 shadow-2xl border border-calma-line animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-calma-line">
          <h2 className="text-lg font-serif font-normal text-calma-ink m-0">
            Copias de seguridad
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-[13.5px] text-calma-muted leading-relaxed m-0">
            Exporta tus tareas, categorías, notas y recordatorios en un archivo JSON o restaura una copia previa.
          </p>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-start gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-calma-accent-soft border-calma-accent text-calma-ink'
                  : 'bg-calma-warn/10 border-calma-warn text-calma-warn'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-calma-accent" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-calma-warn" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Sección Exportar */}
          <div className="p-4 rounded-xl border border-calma-line bg-calma-bg flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-medium text-calma-ink m-0">
                Exportar datos
              </h3>
              <p className="text-[12px] text-calma-muted mt-0.5 m-0">
                Descarga tu copia en un archivo .json
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-calma-surface hover:opacity-90 text-calma-ink rounded-xl text-[13px] font-medium border border-calma-line shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar</span>
            </button>
          </div>

          {/* Sección Importar */}
          <div className="p-4 rounded-xl border border-calma-line bg-calma-bg flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-medium text-calma-ink m-0">
                Importar datos
              </h3>
              <p className="text-[12px] text-calma-muted mt-0.5 m-0">
                Restaura un archivo .json previo
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-calma-accent hover:opacity-90 text-white rounded-xl text-[13px] font-medium shadow-xs transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? 'Cargando...' : 'Importar'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-2 border-t border-calma-line">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-calma-muted hover:text-calma-ink rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
