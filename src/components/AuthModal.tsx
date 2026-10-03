import React, { useState } from 'react';
import { X, Cloud, Lock, Mail, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isConfigured, signIn, signUp } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor, introduce tu correo y contraseña.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await signUp(email.trim(), password);
        setInfoMessage(
          '¡Cuenta creada! Si tu proyecto tiene activada la confirmación por correo, revisa tu bandeja de entrada para verificar tu cuenta.'
        );
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 3000);
      } else {
        await signIn(email.trim(), password);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err?.message || 'Error al conectar con el servidor.';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('Ya existe una cuenta con este correo. Prueba a iniciar sesión.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-calma-surface rounded-2xl p-6 border border-calma-line shadow-2xl space-y-5 animate-page-popup"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-calma-line/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-calma-accent-soft flex items-center justify-center text-calma-accent flex-none">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[16px] font-medium text-calma-ink m-0 leading-tight">
                {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
              </h3>
              <p className="text-[12px] text-calma-muted m-0 mt-0.5">
                Sincroniza tus tareas entre tu iPhone y ordenador
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-calma-muted hover:text-calma-ink rounded-lg hover:bg-calma-bg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isConfigured ? (
          <div className="p-3.5 rounded-xl bg-calma-warn/10 border border-calma-warn/30 text-calma-ink text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-calma-warn flex-none mt-0.5" />
            <p className="m-0 leading-relaxed text-calma-ink">
              Falta configurar tu clave en el archivo <code className="bg-calma-bg px-1 py-0.5 rounded text-[12px]">.env.local</code>. Revisa que <code className="bg-calma-bg px-1 py-0.5 rounded text-[12px]">VITE_SUPABASE_ANON_KEY</code> tenga el valor correcto de tu panel de Supabase.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-calma-warn/10 border border-calma-warn/30 text-calma-ink text-[12.5px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-calma-warn flex-none" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-xl bg-calma-accent-soft border border-calma-accent/40 text-calma-ink text-[12.5px] flex items-start gap-2">
                <Check className="w-4 h-4 text-calma-accent flex-none mt-0.5" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-calma-muted">
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 bg-calma-bg border border-calma-line rounded-xl text-[14.5px] text-calma-ink placeholder:text-calma-muted/60 focus:outline-none focus:border-calma-accent focus:ring-1 focus:ring-calma-accent transition-all"
                />
                <Mail className="w-4 h-4 text-calma-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label className="block text-[12.5px] font-medium text-calma-muted">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-calma-bg border border-calma-line rounded-xl text-[14.5px] text-calma-ink placeholder:text-calma-muted/60 focus:outline-none focus:border-calma-accent focus:ring-1 focus:ring-calma-accent transition-all"
                />
                <Lock className="w-4 h-4 text-calma-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-calma-accent text-white font-medium text-[14px] rounded-xl hover:opacity-95 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Conectando...' : isRegistering ? 'Crear mi cuenta' : 'Entrar a Rekayu'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Alternar entre login y registro */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="text-[12.5px] text-calma-muted hover:text-calma-ink transition-colors cursor-pointer"
              >
                {isRegistering
                  ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                  : '¿Aún no tienes cuenta? Regístrate gratis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
