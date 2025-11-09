import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Doctor } from '../modelos/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctoresService {
  private coleccion;

  constructor(private firestore: Firestore) {
    this.coleccion = collection(this.firestore, 'doctores');
  }

  async agregarDoctor(doctor: Doctor) {
    await addDoc(this.coleccion, doctor);
  }

  async obtenerDoctores(): Promise<Doctor[]> {
    const snapshot = await getDocs(this.coleccion);
    return snapshot.docs.map(d => d.data() as Doctor);
  }

  async actualizarDoctor(id: string, datos: Partial<Doctor>) {
    const ref = doc(this.firestore, 'doctores', id);
    await updateDoc(ref, datos);
  }

  async eliminarDoctor(id: string) {
    const ref = doc(this.firestore, 'doctores', id);
    await deleteDoc(ref);
  }
}
