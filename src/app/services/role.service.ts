import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Role interfaces
export interface Role {
  id: number;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  version: number;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export interface UpdateRoleRequest {
  name: string;
  description: string;
}

export interface UserWithRoles {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface MenuRole {
  id: number;
  menuId: number;
  roleId: number;
  menuName?: string;
  roleName?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('RoleService initialized with base URL:', this.baseUrl);
  }

  /**
   * Get all roles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/roles`).pipe(
      catchError(error => {
        console.error('Error fetching roles:', error);
        return of([]);
      })
    );
  }

  /**
   * Get role by ID
   */
  getRoleById(roleId: number): Observable<Role | null> {
    return this.http.get<Role>(`${this.baseUrl}/roles/${roleId}`).pipe(
      catchError(error => {
        console.error('Error fetching role by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Create new role
   */
  createRole(roleData: CreateRoleRequest): Observable<Role | null> {
    return this.http.post<Role>(`${this.baseUrl}/roles`, roleData).pipe(
      catchError(error => {
        console.error('Error creating role:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing role
   */
  updateRole(roleId: number, roleData: UpdateRoleRequest): Observable<Role | null> {
    return this.http.put<Role>(`${this.baseUrl}/roles/${roleId}`, roleData).pipe(
      catchError(error => {
        console.error('Error updating role:', error);
        throw error;
      })
    );
  }

  /**
   * Delete role
   */
  deleteRole(roleId: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/roles/${roleId}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting role:', error);
        throw error;
      })
    );
  }

  /**
   * Get all available roles (for dropdowns)
   */
  getAvailableRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/menus/roles`).pipe(
      catchError(error => {
        console.error('Error fetching available roles:', error);
        return of([]);
      })
    );
  }

  /**
   * Get users with their roles
   */
  getUsersWithRoles(): Observable<UserWithRoles[]> {
    return this.http.get<UserWithRoles[]>(`${this.baseUrl}/users/crud`).pipe(
      map(users => {
        // Ensure each user has a roles array
        return users.map(user => ({
          ...user,
          roles: user.roles || []
        }));
      }),
      catchError(error => {
        console.error('Error fetching users with roles:', error);
        return of([]);
      })
    );
  }

  /**
   * Assign roles to user
   */
  assignRolesToUser(userId: number, roleNames: string[]): Observable<boolean> {
    return this.http.post(`${this.baseUrl}/users/${userId}/roles`, roleNames).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error assigning roles to user:', error);
        throw error;
      })
    );
  }

  /**
   * Remove roles from user
   */
  removeRolesFromUser(userId: number, roleNames: string[]): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/users/${userId}/roles`, { body: roleNames }).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error removing roles from user:', error);
        throw error;
      })
    );
  }

  /**
   * Get menus for specific role
   */
  getMenusForRole(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/menus/role/${roleId}`).pipe(
      catchError(error => {
        console.error('Error fetching menus for role:', error);
        return of([]);
      })
    );
  }

  /**
   * Set menus for role
   */
  setMenusForRole(roleId: number, menuIds: number[]): Observable<boolean> {
    return this.http.post(`${this.baseUrl}/menus/role/${roleId}`, menuIds).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error setting menus for role:', error);
        throw error;
      })
    );
  }

  /**
   * Get role statistics
   */
  getRoleStatistics(): Observable<any> {
    return this.getAllRoles().pipe(
      map(roles => {
        const totalRoles = roles.length;
        const systemRoles = roles.filter(role => role.createdBy === 'system').length;
        const customRoles = totalRoles - systemRoles;
        
        // Calculate recent roles (created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentRoles = roles.filter(role => 
          new Date(role.createdAt) > sevenDaysAgo
        ).length;

        return {
          totalRoles,
          systemRoles,
          customRoles,
          recentRoles,
          roleTypes: this.categorizeRoles(roles)
        };
      })
    );
  }

  /**
   * Search roles by name or description
   */
  searchRoles(searchTerm: string): Observable<Role[]> {
    return this.getAllRoles().pipe(
      map(roles => roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  /**
   * Validate role permissions (check if user has SUPERADMIN)
   */
  validateSuperAdminAccess(): Observable<boolean> {
    return this.http.get<any>(`${this.baseUrl}/users/current`).pipe(
      map(user => {
        const roles = user.roles || [];
        return roles.some((role: any) => role.name === 'SUPERADMIN');
      }),
      catchError(error => {
        console.error('Error validating super admin access:', error);
        return of(false);
      })
    );
  }

  // Helper methods
  private categorizeRoles(roles: Role[]): { [key: string]: number } {
    const categories = {
      admin: 0,
      user: 0,
      manager: 0,
      other: 0
    };

    roles.forEach(role => {
      const name = role.name.toLowerCase();
      if (name.includes('admin')) {
        categories.admin++;
      } else if (name.includes('manager') || name.includes('supervisor')) {
        categories.manager++;
      } else if (name.includes('user')) {
        categories.user++;
      } else {
        categories.other++;
      }
    });

    return categories;
  }

  /**
   * Format role name for display
   */
  formatRoleName(roleName: string): string {
    return roleName.replace(/^ROLE_/, '').replace(/_/g, ' ').toLowerCase()
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /**
   * Get role color based on type
   */
  getRoleColor(roleName: string): string {
    const name = roleName.toLowerCase();
    if (name.includes('admin') || name.includes('super')) {
      return 'bg-red-100 text-red-800';
    } else if (name.includes('manager') || name.includes('supervisor')) {
      return 'bg-blue-100 text-blue-800';
    } else if (name.includes('user')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }
} 