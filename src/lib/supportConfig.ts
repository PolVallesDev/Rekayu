export interface SupportConfig {
  enableBuyCoffee: boolean;
  buyCoffeeUrl: string;
  contactEmail: string;
  developerName: string;
}

/**
 * Configuración de apoyo e incidencias para el proyecto Rekayu.
 * Puedes activar o desactivar "Buy Me a Coffee" directamente cambiando `enableBuyCoffee`.
 */
export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  enableBuyCoffee: true,
  buyCoffeeUrl: 'https://buymeacoffee.com/rekayu',
  contactEmail: 'contacto@rekayu.app',
  developerName: 'Developer',
};
