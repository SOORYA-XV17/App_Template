import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { RoleService, Role, CreateRoleRequest, UpdateRoleRequest, UserWithRoles } from '../../services/role.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutWrapperComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit, OnDestroy {
  // Data properties
  roles: Role[] = [];
  usersWithRoles: UserWithRoles[] = [];
  roleStatistics: any = {};
  filteredRoles: Role[] = [];
  
  // Loading states
  isLoading = true;
  isLoadingUsers = false;
  isSaving = false;
  isDeleting = false;
  
  // Search and filter
  searchTerm = '';
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showUserRoleModal = false;
  showMenuRoleModal = false;
  
  // Forms
  createRoleForm: FormGroup;
  editRoleForm: FormGroup;
  
  // Selected items
  selectedRole: Role | null = null;
  selectedUser: UserWithRoles | null = null;
  selectedUserRoles: string[] = [];
  availableRoles: Role[] = [];
  
  // Permissions
  hasSuperAdminAccess = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private roleService: RoleService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.createRoleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.editRoleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.checkPermissions();
    this.loadRoles();
    this.loadRoleStatistics();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Permission check
  checkPermissions() {
    const sub = this.roleService.validateSuperAdminAccess().subscribe({
      next: (hasAccess) => {
        this.hasSuperAdminAccess = hasAccess;
        if (!hasAccess) {
          this.toastService.showError('You need SUPERADMIN role to manage roles');
        }
      },
      error: (error) => {
        console.error('Error checking permissions:', error);
        this.hasSuperAdminAccess = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // Load data methods
  loadRoles() {
    this.isLoading = true;
    const sub = this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = roles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.toastService.showError('Failed to load roles');
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadRoleStatistics() {
    const sub = this.roleService.getRoleStatistics().subscribe({
      next: (stats) => {
        this.roleStatistics = stats;
      },
      error: (error) => {
        console.error('Error loading role statistics:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  loadUsersWithRoles() {
    this.isLoadingUsers = true;
    const sub = this.roleService.getUsersWithRoles().subscribe({
      next: (users) => {
        this.usersWithRoles = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users with roles:', error);
        this.toastService.showError('Failed to load users');
        this.isLoadingUsers = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadAvailableRoles() {
    const sub = this.roleService.getAvailableRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
      },
      error: (error) => {
        console.error('Error loading available roles:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  // Search and filter
  onSearch() {
    if (this.searchTerm.trim()) {
      const sub = this.roleService.searchRoles(this.searchTerm).subscribe({
        next: (roles) => {
          this.filteredRoles = roles;
        },
        error: (error) => {
          console.error('Error searching roles:', error);
        }
      });
      this.subscriptions.push(sub);
    } else {
      this.filteredRoles = this.roles;
    }
  }

  // Role CRUD operations
  openCreateModal() {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.createRoleForm.reset();
    this.showCreateModal = true;
  }

  openEditModal(role: Role) {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.selectedRole = role;
    this.editRoleForm.patchValue({
      name: role.name,
      description: role.description
    });
    this.showEditModal = true;
  }

  openDeleteModal(role: Role) {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.selectedRole = role;
    this.showDeleteModal = true;
  }

  createRole() {
    if (this.createRoleForm.valid && !this.isSaving) {
      this.isSaving = true;
      const roleData: CreateRoleRequest = this.createRoleForm.value;
      
      const sub = this.roleService.createRole(roleData).subscribe({
        next: (newRole) => {
          this.toastService.showSuccess('Role created successfully');
          this.showCreateModal = false;
          this.loadRoles();
          this.loadRoleStatistics();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error creating role:', error);
          this.toastService.showError('Failed to create role');
          this.isSaving = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  updateRole() {
    if (this.editRoleForm.valid && this.selectedRole && !this.isSaving) {
      this.isSaving = true;
      const roleData: UpdateRoleRequest = this.editRoleForm.value;
      
      const sub = this.roleService.updateRole(this.selectedRole.id, roleData).subscribe({
        next: (updatedRole) => {
          this.toastService.showSuccess('Role updated successfully');
          this.showEditModal = false;
          this.selectedRole = null;
          this.loadRoles();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating role:', error);
          this.toastService.showError('Failed to update role');
          this.isSaving = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  deleteRole() {
    if (this.selectedRole && !this.isDeleting) {
      this.isDeleting = true;
      
      const sub = this.roleService.deleteRole(this.selectedRole.id).subscribe({
        next: () => {
          this.toastService.showSuccess('Role deleted successfully');
          this.showDeleteModal = false;
          this.selectedRole = null;
          this.loadRoles();
          this.loadRoleStatistics();
          this.isDeleting = false;
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.toastService.showError('Failed to delete role');
          this.isDeleting = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  // User role management
  openUserRoleModal() {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.loadUsersWithRoles();
    this.loadAvailableRoles();
    this.showUserRoleModal = true;
  }

  selectUser(user: UserWithRoles) {
    this.selectedUser = user;
    this.selectedUserRoles = user.roles.map(role => role.name);
  }

  toggleRoleForUser(roleName: string) {
    const index = this.selectedUserRoles.indexOf(roleName);
    if (index > -1) {
      this.selectedUserRoles.splice(index, 1);
    } else {
      this.selectedUserRoles.push(roleName);
    }
  }

  saveUserRoles() {
    if (!this.selectedUser) return;

    const currentRoles = this.selectedUser.roles.map(role => role.name);
    const rolesToAdd = this.selectedUserRoles.filter(role => !currentRoles.includes(role));
    const rolesToRemove = currentRoles.filter(role => !this.selectedUserRoles.includes(role));

    const promises: any[] = [];

    if (rolesToAdd.length > 0) {
      promises.push(this.roleService.assignRolesToUser(this.selectedUser.id, rolesToAdd));
    }

    if (rolesToRemove.length > 0) {
      promises.push(this.roleService.removeRolesFromUser(this.selectedUser.id, rolesToRemove));
    }

    if (promises.length > 0) {
      Promise.all(promises).then(() => {
        this.toastService.showSuccess('User roles updated successfully');
        this.loadUsersWithRoles();
        this.selectedUser = null;
        this.selectedUserRoles = [];
      }).catch(error => {
        console.error('Error updating user roles:', error);
        this.toastService.showError('Failed to update user roles');
      });
    }
  }

  // Utility methods
  hasStatistics(): boolean {
    return this.roleStatistics && this.roleStatistics.totalRoles !== undefined;
  }

  formatRoleName(roleName: string): string {
    return this.roleService.formatRoleName(roleName);
  }

  getRoleColor(roleName: string): string {
    return this.roleService.getRoleColor(roleName);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Modal close methods
  closeCreateModal() {
    this.showCreateModal = false;
    this.createRoleForm.reset();
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editRoleForm.reset();
    this.selectedRole = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedRole = null;
  }

  closeUserRoleModal() {
    this.showUserRoleModal = false;
    this.selectedUser = null;
    this.selectedUserRoles = [];
  }

  // Track by functions for performance
  trackByRoleId(index: number, role: Role): number {
    return role.id;
  }

  trackByUserId(index: number, user: UserWithRoles): number {
    return user.id;
  }
} 