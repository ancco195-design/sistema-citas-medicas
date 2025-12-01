import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DOCTOR_ROUTES } from './doctor.routes';

const routes: Routes = [
  ...DOCTOR_ROUTES
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorRoutingModule { }
