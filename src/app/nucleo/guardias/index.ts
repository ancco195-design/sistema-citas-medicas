/**
 * Archivo de barril (barrel) para exportar todos los guards
 * Permite importar múltiples guards desde un solo lugar
 * 
 * Ejemplo de uso:
 * import { authGuard, rolGuard } from '@nucleo/guardias';
 */

export * from './auth-guard';
export * from './rol-guard';