import { useState, useEffect, useCallback } from 'react';
import { NavSection } from '../types';

const VALID_ROUTES: NavSection[] = ['tareas', 'calendario', 'recordatorios', 'notas', 'ajustes', 'cuenta'];

/**
 * Hook para enrutamiento nativo con URLs reales (/tareas, /calendario, /recordatorios, /notas, /ajustes)
 * sin necesidad de librerías externas pesadas. Soporta botones Atrás/Adelante y enlaces directos.
 */
export const useRouterNav = () => {
  const getSectionFromPath = (): NavSection => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (path === 'inicio') {
      return 'tareas';
    }
    if (VALID_ROUTES.includes(path as NavSection)) {
      return path as NavSection;
    }
    return 'tareas';
  };

  const [activeNav, setActiveNavState] = useState<NavSection>(getSectionFromPath);

  // Sincronizar ruta en la URL al montar y escuchar el evento popstate (Atrás / Adelante del navegador)
  useEffect(() => {
    const currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!VALID_ROUTES.includes(currentPath as NavSection)) {
      window.history.replaceState(null, '', '/tareas');
    }

    const handlePopState = () => {
      setActiveNavState(getSectionFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cambiar de sección actualizando la URL en la barra de direcciones del navegador
  const setActiveNav = useCallback((section: NavSection) => {
    setActiveNavState(section);
    const targetPath = `/${section}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, []);

  return { activeNav, setActiveNav };
};
