import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule

import { AuthRoutingModule } from './auth-routing.module';


import { AuthService } from './services/auth.service'; // <-- Import AuthService
import { HttpClientModule } from '@angular/common/http'; // <-- Import HttpClientModule 
import { LoginComponent } from './components/login1/login.component';
import { MaterialModule } from '../shared/material.module';



@NgModule({
declarations: [
  LoginComponent,
],
imports: [
  CommonModule,
  AuthRoutingModule,
  FormsModule,
  MaterialModule
]
})
export class AuthModule { }