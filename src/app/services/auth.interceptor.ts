import { inject } from '@angular/core';
import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const accessToken = authService.getToken();
  
  // Check if this is a request to our backend API
  const isBackendApiRequest = req.url.includes('localhost:8080/api') || req.url.includes('/api');
  
  let authReq = req;
  
  // Add headers for backend API requests
  if (isBackendApiRequest) {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    // Add JWT token if available
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    authReq = req.clone({ setHeaders: headers });
    
    console.log(`Backend API Request: ${req.method} ${req.url}`);
    if (accessToken) {
      console.log('JWT Token added to request');
    } else {
      console.warn('No JWT token available for backend request');
    }
  } else if (accessToken) {
    // For non-backend requests, just add the token if available
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  let isRefreshing = false;
  const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  const handle401Error = (request: HttpRequest<any>): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      console.log('Attempting to refresh token due to 401 error...');
      
      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          const newToken = response.accessToken;
          refreshTokenSubject.next(newToken);
          localStorage.setItem('accessToken', newToken);
          
          console.log('Token refreshed successfully');
          
          // Retry the original request with new token
          const retryHeaders: { [key: string]: string } = {
            'Authorization': `Bearer ${newToken}`
          };
          
          if (isBackendApiRequest) {
            retryHeaders['Content-Type'] = 'application/json';
          }
          
          return next(request.clone({ setHeaders: retryHeaders }));
        }),
        catchError((err) => {
          isRefreshing = false;
          console.error('Token refresh failed:', err);
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          const retryHeaders: { [key: string]: string } = {
            'Authorization': `Bearer ${token}`
          };
          
          if (isBackendApiRequest) {
            retryHeaders['Content-Type'] = 'application/json';
          }
          
          return next(request.clone({ setHeaders: retryHeaders }));
        })
      );
    }
  };

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        console.error(`HTTP Error ${error.status}:`, error.message);
        
        if (error.status === 401 && isBackendApiRequest) {
          console.log('401 Unauthorized - attempting token refresh');
          return handle401Error(authReq);
        }
        
        if (error.status === 0) {
          console.error('Network error - backend server may be unreachable');
        }
      }
      return throwError(() => error);
    })
  );
}; 