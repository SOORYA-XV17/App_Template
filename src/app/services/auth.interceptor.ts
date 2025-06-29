import { inject } from '@angular/core';
import { HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const accessToken = authService.getToken();
  let authReq = req;
  if (accessToken) {
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

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response.accessToken);
          localStorage.setItem('accessToken', response.accessToken);
          return next(
            request.clone({ setHeaders: { Authorization: `Bearer ${response.accessToken}` } })
          );
        }),
        catchError((err) => {
          isRefreshing = false;
          authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next(
          request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        ))
      );
    }
  };

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq);
      }
      return throwError(() => error);
    })
  );
}; 