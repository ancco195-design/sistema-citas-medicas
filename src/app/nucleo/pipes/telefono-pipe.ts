import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para formatear números de teléfono
 * Convierte: 987654321 → 987 654 321
 * 
 * Uso: {{ telefono | telefono }}
 */
@Pipe({
  name: 'telefono',
  standalone: true
})
export class TelefonoPipe implements PipeTransform {
  
  /**
   * Transforma un número de teléfono a formato legible
   * @param value - Número de teléfono (string o number)
   * @returns Teléfono formateado con espacios
   */
  transform(value: string | number | null | undefined): string {
    // Si no hay valor, retornar mensaje
    if (!value || value === '' || value === null || value === undefined) {
      return 'No registrado';
    }
    
    // Convertir a string y quitar espacios/guiones
    const telefono = value.toString().replace(/\s|-/g, '');
    
    // Si no tiene 9 dígitos, retornar original
    if (telefono.length !== 9) {
      return value.toString();
    }
    
    // Formatear: 987654321 → 987 654 321
    return telefono.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
}