import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserInfoResponse } from '../models/user-info.model'; // Import the interface
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root' 
})
export class AuthService {

  private apiUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<UserInfoResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));


  constructor(private http: HttpClient,private router:Router) { }

  public get currentUserValue(): UserInfoResponse | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<UserInfoResponse> {
    const loginUrl = `${this.apiUrl}/login`;
    const body = new HttpParams()
      .set('username', username)
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<UserInfoResponse>(loginUrl, body.toString(), { headers })
      .pipe(
        tap(userInfo => {
          console.log('Received user info on login:', userInfo);
         this.currentUserSubject.next(userInfo);
        }),
        catchError(this.handleError) 
      );
  }


  logout(): Observable<any> {
     const logoutUrl = `${this.apiUrl}/logout`;
     return this.http.post(logoutUrl, {}).pipe( // Empty body for logout
         tap(() => {
          
             console.log('Logout successful');
             this.currentUserSubject.next(null);
             this.router.navigate(['/auth/login']);
         }),
         catchError(this.handleError)
     );
  }

  checkAuthenticationStatus(): Observable<UserInfoResponse | null> {
    const meUrl = `${this.apiUrl}/me`;
    // The HttpInterceptor will add `withCredentials: true`
    return this.http.get<UserInfoResponse>(meUrl).pipe(
      tap(userInfo => {
        console.log('AuthService: Checked status, user is logged in:', userInfo);
        this.currentUserSubject.next(userInfo);
        // localStorage.setItem('currentUser', JSON.stringify(userInfo));
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
           console.log('AuthService: Checked status, user is NOT logged in.');
           this.currentUserSubject.next(null); // Ensure state is cleared
           // localStorage.removeItem('currentUser');
        } else {
          console.error('AuthService: Error checking auth status:', error);
        }
        // Don't throw an error here for check status, just return null or handle gracefully
        return throwError(() => error); // Or return of(null); if you don't need the component to know about the error
      })
    );
  }




 
  private handleError(error: HttpErrorResponse) {
    console.error('AuthService Error:', error);
    return throwError(() => error); 
  }
}