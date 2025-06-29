import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  message: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  roles?: string[];
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface OtpRequest {
  email: string;
}

export interface OtpForgotRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.userService.loadUserProfile().subscribe();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          localStorage.setItem('username', response.username);
          if (response.roles) {
            localStorage.setItem('roles', JSON.stringify(response.roles));
          }
          this.currentUserSubject.next({ 
            username: response.username, 
            token: response.accessToken,
            roles: response.roles || []
          });
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/crud`, userData);
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token) {
      // If no token, just clear local data
      localStorage.clear();
      this.currentUserSubject.next(null);
      this.userService.clearUserData();
      return new Observable(subscriber => {
        subscriber.next(null);
        subscriber.complete();
      });
    }
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = refreshToken ? { refreshToken } : {};

    return this.http.post(`${this.baseUrl}/auth/logout`, body, { 
      headers,
      // Add error handling options
      observe: 'response',
      responseType: 'text'
    }).pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('roles');
        localStorage.removeItem('username');
        this.currentUserSubject.next(null);
        this.userService.clearUserData();
      }),
      finalize(() => {
        // Always clear local data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('roles');
        localStorage.removeItem('username');
        this.currentUserSubject.next(null);
        this.userService.clearUserData();
      })
    );
  }

  sendForgotPasswordOtp(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/otp/send-forgot`, { email });
  }

  verifyForgotPasswordOtp(data: OtpForgotRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/otp/verify-forgot`, data);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      })
    );
  }

  getUserRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('ROLE_ADMIN');
  }
}