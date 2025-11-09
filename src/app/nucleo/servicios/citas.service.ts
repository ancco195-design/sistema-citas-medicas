import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  CollectionReference
} from '@angular/fire/firestore';
import { Cita } from '../modelos/cita.model';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private coleccion: CollectionReference;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'citas');
  }

  async crearCita(cita: Cita) {
    return await addDoc(this.coleccion, cita);
  }

  async obtenerCitasPorPaciente(pacienteId: string): Promise<Cita[]> {
    const q = query(this.coleccion, where('pacienteId', '==', pacienteId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as Cita);
  }

  async actualizarCita(id: string, datos: Partial<Cita>) {
    const ref = doc(this.firestore, 'citas', id);
    await updateDoc(ref, datos);
  }

  async eliminarCita(id: string) {
    const ref = doc(this.firestore, 'citas', id);
    await deleteDoc(ref);
  }
}
