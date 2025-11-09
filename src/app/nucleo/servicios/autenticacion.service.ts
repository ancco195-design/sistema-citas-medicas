import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { UserCredential } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(private auth: Auth) {}

  async registrar(email: string, password: string): Promise<UserCredential> {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async iniciarSesion(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async cerrarSesion(): Promise<void> {
    return await signOut(this.auth);
  }

  obtenerUsuarioActual() {
    return this.auth.currentUser;
  }
}
