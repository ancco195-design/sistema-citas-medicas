import { Injectable } from '@angular/core';

/**
 * Servicio de Storage
 * Maneja la conversión de imágenes a Base64 y validaciones
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /**
   * Convertir archivo de imagen a Base64
   * @param file Archivo de imagen
   * @returns Promise con el string Base64
   */
  async convertirImagenABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validar que el archivo sea una imagen válida
   * @param file Archivo a validar
   * @returns Objeto con validación y mensaje de error
   */
  validarImagen(file: File): { valido: boolean; mensaje: string } {
    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      return {
        valido: false,
        mensaje: 'Solo se permiten imágenes JPG, PNG o WEBP'
      };
    }

    // Validar tamaño (máximo 2MB)
    const tamañoMaximo = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > tamañoMaximo) {
      return {
        valido: false,
        mensaje: 'La imagen no debe superar los 2MB'
      };
    }

    return {
      valido: true,
      mensaje: 'Imagen válida'
    };
  }

  /**
   * Comprimir imagen antes de convertir a Base64
   * @param file Archivo de imagen
   * @param maxWidth Ancho máximo
   * @param maxHeight Alto máximo
   * @param quality Calidad (0-1)
   * @returns Promise con el string Base64 comprimido
   */
  async comprimirImagen(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 800, 
    quality: number = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo el aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir canvas a Base64
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}