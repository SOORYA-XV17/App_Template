import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { UserService, User, Role, UserCreateRequest } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LayoutWrapperComponent, ToastComponent],
  template: `
    <app-layout-wrapper pageTitle="User Management">
      <div class="p-6">
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
          <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
          <p class="mt-1 text-gray-600">Manage system users and their permissions</p>
            </div>
            <div class="flex gap-3">
              <button 
                (click)="showCreateUserForm = true" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add User
              </button>
              <button 
                (click)="showCreateRoleForm = true" 
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Add Role
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-3 text-gray-600">Loading users...</span>
          </div>
        </div>
        
        <!-- Error State -->
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            <span class="text-red-800">{{ error }}</span>
          </div>
        </div>

        <!-- Users Table -->
        <div *ngIf="!loading && !error" class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Users ({{ users.length }})</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let user of users" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-blue-600">{{ user.username.charAt(0).toUpperCase() }}</span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                        <div class="text-sm text-gray-500">ID: {{ user.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        *ngFor="let role of user.roles" 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {{ role.name }}
                      </span>
                      <span *ngIf="user.roles.length === 0" class="text-sm text-gray-500">No roles</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span 
                        [class]="user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ user.enabled ? 'Active' : 'Inactive' }}
                      </span>
                      <span 
                        *ngIf="!user.accountNonLocked"
                        class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Locked
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button 
                        (click)="openRoleModal(user)"
                        class="text-blue-600 hover:text-blue-900">
                        Manage Roles
                      </button>
                      <button 
                        (click)="deleteUser(user.id)"
                        class="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Roles Table -->
        <div *ngIf="!loading && !error" class="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Roles ({{ roles.length }})</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let role of roles" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                    <div class="text-sm text-gray-500">ID: {{ role.id }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ role.description || 'No description' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      (click)="deleteRole(role.id)"
                      class="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Create User Modal -->
        <div *ngIf="showCreateUserForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form [formGroup]="userForm" (ngSubmit)="createUser()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Username</label>
                  <input 
                    type="text" 
                    formControlName="username"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="userForm.get('username')?.invalid && userForm.get('username')?.touched" class="text-red-500 text-sm mt-1">
                    Username is required and must be 3-50 characters
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                    Valid email is required
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password" 
                    formControlName="password"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
                    Password must be at least 8 characters
                  </div>
                </div>
                <div class="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    [disabled]="userForm.invalid || creatingUser"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md">
                    {{ creatingUser ? 'Creating...' : 'Create User' }}
                  </button>
                  <button 
                    type="button" 
                    (click)="showCreateUserForm = false"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Create Role Modal -->
        <div *ngIf="showCreateRoleForm" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Role</h3>
              <form [formGroup]="roleForm" (ngSubmit)="createRole()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Role Name</label>
                  <input 
                    type="text" 
                    formControlName="name"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <div *ngIf="roleForm.get('name')?.invalid && roleForm.get('name')?.touched" class="text-red-500 text-sm mt-1">
                    Role name is required and must be 2-50 characters
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea 
                    formControlName="description"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>
                <div class="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    [disabled]="roleForm.invalid || creatingRole"
                    class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md">
                    {{ creatingRole ? 'Creating...' : 'Create Role' }}
                  </button>
                  <button 
                    type="button" 
                    (click)="showCreateRoleForm = false"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Role Management Modal -->
        <div *ngIf="showRoleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Manage Roles for {{ selectedUser?.username }}</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div *ngFor="let role of roles" class="flex items-center">
                      <input 
                        type="checkbox" 
                        [id]="'role-' + role.id"
                        [checked]="isRoleAssigned(role.name)"
                        (change)="toggleRole(role.name)"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                      <label [for]="'role-' + role.id" class="ml-2 text-sm text-gray-700">{{ role.name }}</label>
                    </div>
                  </div>
                </div>
                <div class="flex gap-3 pt-4">
                  <button 
                    (click)="saveUserRoles()"
                    [disabled]="updatingRoles"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md">
                    {{ updatingRoles ? 'Saving...' : 'Save Changes' }}
                  </button>
                  <button 
                    (click)="showRoleModal = false"
                    class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout-wrapper>
    
    <!-- Toast Notifications -->
    <app-toast></app-toast>
  `,
  styles: []
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  loading = false;
  error = '';
  creatingUser = false;
  creatingRole = false;
  updatingRoles = false;
  
  showCreateUserForm = false;
  showCreateRoleForm = false;
  showRoleModal = false;
  selectedUser: User | null = null;
  selectedRoles: string[] = [];

  userForm: FormGroup;
  roleForm: FormGroup;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.userService.getAllUsers().toPromise(),
      this.userService.getAllRoles().toPromise()
    ]).then(([users, roles]) => {
      this.users = users || [];
      this.roles = roles || [];
      this.loading = false;
    }).catch(err => {
      this.error = 'Failed to load data: ' + (err.error?.message || err.message);
      this.loading = false;
    });
  }

  createUser(): void {
    if (this.userForm.invalid) return;

    this.creatingUser = true;
    const userData: UserCreateRequest = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.users.push(user);
        this.userForm.reset();
        this.showCreateUserForm = false;
        this.creatingUser = false;
        this.toastService.showSuccess('User created successfully');
      },
      error: (err) => {
        this.creatingUser = false;
        this.toastService.showError('Failed to create user: ' + (err.error?.error || err.message));
      }
    });
  }

  createRole(): void {
    if (this.roleForm.invalid) return;

    this.creatingRole = true;
    const roleData = this.roleForm.value;

    this.userService.createRole(roleData).subscribe({
      next: (role) => {
        this.roles.push(role);
        this.roleForm.reset();
        this.showCreateRoleForm = false;
        this.creatingRole = false;
        this.toastService.showSuccess('Role created successfully');
      },
      error: (err) => {
        this.creatingRole = false;
        this.toastService.showError('Failed to create role: ' + (err.error?.message || err.message));
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.toastService.showSuccess('User deleted successfully');
        },
        error: (err) => {
          this.toastService.showError('Failed to delete user: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteRole(roleId: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      this.userService.deleteRole(roleId).subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== roleId);
          this.toastService.showSuccess('Role deleted successfully');
        },
        error: (err) => {
          this.toastService.showError('Failed to delete role: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRoles = [...user.roles.map(r => r.name)];
    this.showRoleModal = true;
  }

  isRoleAssigned(roleName: string): boolean {
    return this.selectedRoles.includes(roleName);
  }

  toggleRole(roleName: string): void {
    const index = this.selectedRoles.indexOf(roleName);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push(roleName);
    }
  }

  saveUserRoles(): void {
    if (!this.selectedUser) return;

    this.updatingRoles = true;
    const currentRoles = this.selectedUser.roles.map(r => r.name);
    const rolesToAdd = this.selectedRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !this.selectedRoles.includes(r));

    const updatePromises: Promise<User>[] = [];

    if (rolesToAdd.length > 0) {
      updatePromises.push(
        this.userService.assignRolesToUser(this.selectedUser.id, rolesToAdd).toPromise() as Promise<User>
      );
    }

    if (rolesToRemove.length > 0) {
      updatePromises.push(
        this.userService.removeRolesFromUser(this.selectedUser.id, rolesToRemove).toPromise() as Promise<User>
      );
    }

    Promise.all(updatePromises).then(() => {
      // Refresh the user data
      this.userService.getUserById(this.selectedUser!.id).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index > -1) {
            this.users[index] = updatedUser;
          }
          this.showRoleModal = false;
          this.updatingRoles = false;
          this.toastService.showSuccess('User roles updated successfully');
        },
        error: (err) => {
          this.updatingRoles = false;
          this.toastService.showError('Failed to update user roles: ' + (err.error?.message || err.message));
        }
      });
    }).catch(err => {
      this.updatingRoles = false;
      this.toastService.showError('Failed to update user roles: ' + (err.error?.message || err.message));
    });
  }
} 