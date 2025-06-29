import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';

interface Menu {
  id: number;
  name: string;
  path: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  icon?: string;
  parentMenu?: Menu;
}

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface MenuCreateRequest {
  name: string;
  path: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  icon?: string;
  parentMenuId?: number;
}

interface RoleMenuResponse {
  role: string;
  menus: Menu[];
  count: number;
}

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    LayoutWrapperComponent
  ],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.css']
})
export class MenuManagementComponent implements OnInit {
  menus: Menu[] = [];
  roles: Role[] = [];
  filteredMenus: Menu[] = [];
  parentMenus: Menu[] = [];
  menuForm: FormGroup;
  selectedMenu: Menu | null = null;
  showMenuModal = false;
  showDeleteModal = false;
  showRoleModal = false;
  selectedMenuForDelete: Menu | null = null;
  selectedMenuForRole: Menu | null = null;
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  loading = false;
  selectedMenuIds: Set<number> = new Set();
  selectedRoleId: number | null = null;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      path: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      displayOrder: [null, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.maxLength(500)]],
      isActive: [true],
      icon: ['', [Validators.maxLength(50)]],
      parentMenuId: [null]
    });
  }

  ngOnInit(): void {
    this.loadMenus();
    this.loadRoles();
  }

  loadMenus(): void {
    this.loading = true;
    this.http.get<Menu[]>(`${environment.apiUrl}/menus`).subscribe({
      next: (data) => {
        this.menus = data;
        this.parentMenus = data.filter(menu => !menu.parentMenu);
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to load menus');
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.http.get<Role[]>(`${environment.apiUrl}/menus/roles`).subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.warn('Failed to load roles - permission denied. Using default roles.');
        // Fallback to default roles if permission denied
        this.roles = [
          { id: 1, name: 'SUPERADMIN', description: 'Super Administrator' },
          { id: 2, name: 'ADMIN', description: 'Administrator' },
          { id: 3, name: 'USER', description: 'Regular User' }
        ];
        this.toastService.showInfo('Using default roles (permission to load roles denied)');
      }
    });
  }

  openMenuModal(menu?: Menu): void {
    this.selectedMenu = menu || null;
    if (menu) {
      this.menuForm.patchValue({
        name: menu.name,
        path: menu.path,
        displayOrder: menu.displayOrder,
        description: menu.description || '',
        isActive: menu.isActive,
        icon: menu.icon || '',
        parentMenuId: menu.parentMenu?.id || null
      });
    } else {
      this.menuForm.reset({ isActive: true });
    }
    this.showMenuModal = true;
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
    this.selectedMenu = null;
    this.menuForm.reset({ isActive: true });
  }

  saveMenu(): void {
    if (this.menuForm.invalid) return;

    const formValue = this.menuForm.value;
    const menuData: MenuCreateRequest = {
      name: formValue.name,
      path: formValue.path,
      displayOrder: formValue.displayOrder,
      description: formValue.description,
      isActive: formValue.isActive,
      icon: formValue.icon,
      parentMenuId: formValue.parentMenuId
    };

    if (this.selectedMenu) {
      // Update existing menu - backend expects full Menu object
      const updateData = {
        ...menuData,
        id: this.selectedMenu.id
      };
      
      this.http.put<Menu>(`${environment.apiUrl}/menus/${this.selectedMenu.id}`, updateData).subscribe({
        next: (data) => {
          this.toastService.showSuccess('Menu updated successfully');
          this.loadMenus();
          this.closeMenuModal();
        },
        error: (error) => {
          this.toastService.showError('Failed to update menu');
        }
      });
    } else {
      // Create new menu
      this.http.post<Menu>(`${environment.apiUrl}/menus`, menuData).subscribe({
        next: (data) => {
          this.toastService.showSuccess('Menu created successfully');
          this.loadMenus();
          this.closeMenuModal();
        },
        error: (error) => {
          this.toastService.showError('Failed to create menu');
        }
      });
    }
  }

  openDeleteModal(menu: Menu): void {
    this.selectedMenuForDelete = menu;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedMenuForDelete = null;
  }

  deleteMenu(): void {
    if (!this.selectedMenuForDelete) return;

    this.http.delete(`${environment.apiUrl}/menus/${this.selectedMenuForDelete.id}`).subscribe({
      next: () => {
        this.toastService.showSuccess('Menu deleted successfully');
        this.loadMenus();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.toastService.showError('Failed to delete menu');
      }
    });
  }

  openRoleModal(menu: Menu): void {
    this.selectedMenuForRole = menu;
    this.showRoleModal = true;
    this.loadMenuRoles(menu.id);
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedMenuForRole = null;
  }

  loadMenuRoles(menuId: number): void {
    // Implementation for loading menu roles
    console.log('Loading roles for menu:', menuId);
  }

  saveMenuRoles(): void {
    if (!this.selectedMenuForRole || !this.selectedRoleId) return;

    const roleMenuData = {
      menuId: this.selectedMenuForRole.id,
      roleId: this.selectedRoleId
    };

    this.http.post(`${environment.apiUrl}/menus/roles`, roleMenuData).subscribe({
      next: () => {
        this.toastService.showSuccess('Role assigned successfully');
        this.closeRoleModal();
      },
      error: (error) => {
        this.toastService.showError('Failed to assign role');
      }
    });
  }

  toggleMenuStatus(menu: Menu): void {
    const updateData = {
      ...menu,
      isActive: !menu.isActive
    };

    this.http.put<Menu>(`${environment.apiUrl}/menus/${menu.id}`, updateData).subscribe({
      next: (data) => {
        this.toastService.showSuccess(`Menu ${data.isActive ? 'activated' : 'deactivated'} successfully`);
        this.loadMenus();
      },
      error: (error) => {
        this.toastService.showError('Failed to update menu status');
      }
    });
  }

  moveMenu(menu: Menu, direction: 'up' | 'down'): void {
    const currentIndex = this.menus.findIndex(m => m.id === menu.id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= this.menus.length) return;

    const updatedMenus = [...this.menus];
    moveItemInArray(updatedMenus, currentIndex, newIndex);

    // Update display order for affected menus
    updatedMenus.forEach((m, index) => {
      m.displayOrder = index + 1;
    });

    // Send update to backend
    this.http.put(`${environment.apiUrl}/menus/reorder`, updatedMenus).subscribe({
      next: () => {
        this.loadMenus();
      },
      error: (error) => {
        this.toastService.showError('Failed to reorder menus');
      }
    });
  }

  onDrop(event: CdkDragDrop<Menu[]>): void {
    moveItemInArray(this.filteredMenus, event.previousIndex, event.currentIndex);

    // Update display order for all menus
    this.filteredMenus.forEach((menu, index) => {
      menu.displayOrder = index + 1;
    });

    // Send update to backend
    this.http.put(`${environment.apiUrl}/menus/reorder`, this.filteredMenus).subscribe({
      next: () => {
        this.toastService.showSuccess('Menu order updated successfully');
        this.loadMenus();
      },
      error: (error) => {
        this.toastService.showError('Failed to update menu order');
      }
    });
  }

  toggleMenuSelection(menuId: number): void {
    if (this.selectedMenuIds.has(menuId)) {
      this.selectedMenuIds.delete(menuId);
    } else {
      this.selectedMenuIds.add(menuId);
    }
  }

  bulkToggleStatus(activate: boolean): void {
    if (this.selectedMenuIds.size === 0) return;

    const menuIds = Array.from(this.selectedMenuIds);
    this.http.put(`${environment.apiUrl}/menus/bulk-status`, {
      menuIds: menuIds,
      isActive: activate
    }).subscribe({
      next: () => {
        this.toastService.showSuccess(`${this.selectedMenuIds.size} menus ${activate ? 'activated' : 'deactivated'} successfully`);
        this.selectedMenuIds.clear();
        this.loadMenus();
      },
      error: (error) => {
        this.toastService.showError('Failed to update menu status');
      }
    });
  }

  applyFilters(): void {
    this.filteredMenus = this.menus.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           menu.path.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' ||
                           (this.statusFilter === 'active' && menu.isActive) ||
                           (this.statusFilter === 'inactive' && !menu.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  toggleAllMenus(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.filteredMenus.forEach(menu => this.selectedMenuIds.add(menu.id));
    } else {
      this.selectedMenuIds.clear();
    }
  }
} 