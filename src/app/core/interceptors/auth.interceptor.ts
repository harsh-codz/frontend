import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.startsWith('/api/')) { 
        request = request.clone({
          withCredentials: true
        });
        console.log('AuthInterceptor: Added withCredentials=true to request for', request.url);
    } else {
        console.log('AuthInterceptor: Skipping withCredentials for external URL:', request.url);
    }


    return next.handle(request);
  }
}