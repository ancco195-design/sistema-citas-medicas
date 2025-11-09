import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Usuario } from '../modelos/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private coleccion;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'usuarios');
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    const snapshot = await getDocs(this.coleccion);
    return snapshot.docs.map(d => d.data() as Usuario);
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>) {
    const ref = doc(this.firestore, 'usuarios', id);
    await updateDoc(ref, datos);
  }

  async eliminarUsuario(id: string) {
    const ref = doc(this.firestore, 'usuarios', id);
    await deleteDoc(ref);
  }
}
