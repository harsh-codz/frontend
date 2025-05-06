import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router'; // Import Router
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators'; // Import operators
import { AuthService } from '../../auth/services/auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isLoggedIn$.pipe(
      take(1), // Take the current value and complete
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('AuthGuard: Access granted.');
          return true; // User is logged in, allow access
        } else {
          console.log('AuthGuard: Access denied, redirecting to login.');
          // User is not logged in, redirect to login page
          // Pass the attempted URL as a query parameter (optional, for redirecting back after login)
          return this.router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
        }
      })
    );
  }
}