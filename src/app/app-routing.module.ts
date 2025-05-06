import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: 'auth', // Base path for authentication-related routes
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) // Lazy load AuthModule
  },
  {
    path: '', // Base path for ALL authenticated routes using the layout
    component: LayoutComponent, // Use LayoutComponent as the wrapper
    canActivate: [AuthGuard], // Protect access to the layout and all its children
    children: [
      {
        path: 'dashboard', // Path is '/dashboard'
        component: DashboardComponent
      },
      // --- Add future feature module routes here as children ---
      // Example:
      {
        path: 'admin/rooms', // Path is '/admin/rooms'
        loadChildren: () => import('./features/room-management/room-management.module').then(m => m.RoomManagementModule),
        // Optional: Add specific role guard if needed: canActivate: [RoleGuard]
      },
      // { path: 'billing', component: BillingComponent }, // etc.

      // --- Default route WITHIN the Layout ---
      // If user navigates to just '/' AFTER being logged in, redirect to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }