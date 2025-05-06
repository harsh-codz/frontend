import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthService } from './auth/services/auth.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/components/header/header.component';
import { SidebarComponent } from './layout/components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './shared/material.module';


export function initializeAppFactory(authService: AuthService): () => Observable<any> {
  return () => {
    console.log('APP_INITIALIZER: Checking authentication status...');
    // Important: The interceptor adds withCredentials: true here too!
    return authService.checkAuthenticationStatus().pipe(
      tap((user) => {
         if(user) {
           console.log('APP_INITIALIZER: User session restored successfully.');
         } else {
            // This case might not happen if checkAuthenticationStatus throws 401 error
           console.log('APP_INITIALIZER: No active user session found.');
         }
      }),
      catchError((error) => {
        // --- Gracefully handle errors during initialization ---
        // If /api/auth/me returns 401 (not logged in), it's expected.
        // For other errors (network, server down), we still want the app to load.
        if (error.status === 401) {
           console.log('APP_INITIALIZER: No active session (401). Proceeding in logged-out state.');
        } else {
           console.error('APP_INITIALIZER: Error checking auth status:', error);
           // Potentially report this error, but allow app to continue
        }
        // AuthService's checkAuthenticationStatus should have already set currentUserSubject to null on error.
        // Return an observable that completes successfully ('of(null)') so the app doesn't break.
        return of(null);
      })
    );
  };
}


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
FormsModule,
MaterialModule  ,
],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },  {
    provide: APP_INITIALIZER,
    useFactory: initializeAppFactory,
    deps: [AuthService], // Provide AuthService as a dependency to the factory
    multi: true // Required for APP_INITIALIZER
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
