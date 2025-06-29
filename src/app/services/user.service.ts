import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  roles: string[];
  accountNonLocked: boolean;
  accountExpiryDate: string;
  avatarLetter: string;
  enabled: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  accountNonLocked: boolean;
  failedLoginAttempts: number;
  accountExpiryDate: string;
  enabled: boolean;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize service but don't automatically load profile
    // Profile loading will be triggered explicitly when needed
  }

  // User CRUD Operations
  createUser(userData: UserCreateRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/crud`, userData);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/crud`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/crud/${id}`);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/crud/${id}`);
  }

  // Role Management
  assignRolesToUser(userId: number, roleNames: string[]): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users/${userId}/roles`, roleNames);
  }

  removeRolesFromUser(userId: number, roleNames: string[]): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/users/${userId}/roles`, { body: roleNames });
  }

  // Role CRUD Operations
  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, role);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/roles/${id}`);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Profile Management (existing methods)
  loadUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/users/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/users/profile`, data).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/change-password`, {
      currentPassword,
      newPassword
    });
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  clearUserData(): void {
    this.currentUserSubject.next(null);
  }
} 