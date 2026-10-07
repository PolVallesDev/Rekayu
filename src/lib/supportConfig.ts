export interface SupportConfig {
  /**
   * Controla la visibilidad del botón y opción "Invitar a un café" en la app.
   * Cambiar a `false` para ocultarlo completamente; `true` para mostrarlo.
   */
  enableBuyCoffee: boolean;
  buyCoffeeUrl: string;
  contactEmail: string;
  developerName: string;
}

/**
 * CONFIGURACIÓN PARA ADMINISTRADORES / DESARROLLADORES
 * 
 * Esta configuración no está expuesta en los ajustes del usuario final.
 * Para activar o desactivar la opción de invitar a un café, cambia directamente `enableBuyCoffee`:
 *  - true  => Visible en la ventana de apoyo / donaciones
 *  - false => Totalmente oculta
 * 
 * (Nota: Cuando se desarrolle un panel de administración en el futuro,
 * esta opción volverá a estar disponible en la interfaz solo con rol de admin).
 */
export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  enableBuyCoffee: false,
  buyCoffeeUrl: 'https://buymeacoffee.com/rekayu',
  contactEmail: 'contacto@rekayu.app',
  developerName: 'Developer',
};

