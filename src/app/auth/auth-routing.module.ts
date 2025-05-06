import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login1/login.component'; // Import LoginComponent

const routes: Routes = [
  {
    path: 'login', // Path within the auth module (e.g., /auth/login)
    component: LoginComponent
  },
  {
    path: '', // Default route for the auth module
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }