import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { MenuService, Menu, MenuCreateRequest, MenuUpdateRequest, MenuStatistics, RoleMenuResponse } from '../../services/menu.service';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { RoleService, Role } from '../../services/role.service';

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
export class MenuManagementComponent implements OnInit, OnDestroy {
  // Data properties
  menus: Menu[] = [];
  roles: Role[] = [];
  filteredMenus: Menu[] = [];
  parentMenus: Menu[] = [];
  menuStatistics: MenuStatistics = {
    totalMenus: 0,
    activeMenus: 0,
    inactiveMenus: 0,
    rootMenus: 0,
    subMenus: 0,
    recentMenus: 0
  };

  // Form and selected items
  menuForm: FormGroup;
  selectedMenu: Menu | null = null;
  selectedMenuForDelete: Menu | null = null;
  selectedMenuForRole: Menu | null = null;
  selectedRoleId: number | null = null;
  selectedMenuIds: Set<number> = new Set();

  // Modal states
  showMenuModal = false;
  showDeleteModal = false;
  showRoleModal = false;
  showBulkModal = false;

  // Filter and search
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  
  // Loading states
  isLoading = true;
  isLoadingRoles = false;
  isSaving = false;
  isDeleting = false;
  isMoving = false;

  // Permissions
  hasSuperAdminAccess = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private menuService: MenuService,
    private toastService: ToastService,
    private fb: FormBuilder,
    private authService: AuthService,
    private roleService: RoleService
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
    this.checkPermissions();
    this.subscribeToMenuData();
    this.loadMenuStatistics();
    this.loadRoles();
    
    this.menuService.refreshAllMenus().subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Permission check
  checkPermissions(): void {
    try {
      const userRoles = this.authService.getUserRoles();
      this.hasSuperAdminAccess = userRoles.some(role => 
        role === 'SUPERADMIN' || role === 'ROLE_SUPERADMIN'
      );

      if (!this.hasSuperAdminAccess) {
        this.toastService.showError('You need SUPERADMIN role to manage menus');
        console.warn('Permission Denied: User does not have SUPERADMIN role.', userRoles);
      } else {
        console.log('Permission Granted: User has SUPERADMIN role.', userRoles);
      }
    } catch (error: any) {
      console.error('Error checking permissions:', error);
      this.hasSuperAdminAccess = false;
    }
  }

  // Load data methods
  subscribeToMenuData(): void {
    this.isLoading = true;
    const sub = this.menuService.allMenus$.subscribe({
      next: (data) => {
        this.menus = data;
        this.parentMenus = data.filter(menu => !menu.parentMenu);
        this.applyFilters();
        this.isLoading = false;
        console.log('MENU_MGMT: Updated with new menu data from service.', this.menus);
      },
      error: (error) => {
        this.toastService.showError('Failed to load menus');
        this.isLoading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  loadMenuStatistics(): void {
    const sub = this.menuService.getMenuStatistics().subscribe({
      next: (stats) => {
        this.menuStatistics = stats;
      },
      error: (error) => {
        console.error('Error loading menu statistics:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    const sub = this.roleService.getAllRoles().subscribe({
      next: (data: Role[]) => {
        this.roles = data;
        this.isLoadingRoles = false;
      },
      error: (error: any) => {
        console.warn('Failed to load roles - using fallback roles', error);
        this.roles = [
          { id: 1, name: 'SUPERADMIN', description: 'Super Administrator' } as Role,
          { id: 2, name: 'ADMIN', description: 'Administrator' } as Role,
          { id: 3, name: 'USER', description: 'Regular User' } as Role
        ];
        this.toastService.showInfo('Using default roles (permission to load roles denied)');
        this.isLoadingRoles = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // Menu CRUD operations
  openMenuModal(menu?: Menu): void {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    
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
      this.menuForm.reset({ 
        isActive: true, 
        displayOrder: this.getNextDisplayOrder() 
      });
    }
    this.showMenuModal = true;
  }

  closeMenuModal(): void {
    this.showMenuModal = false;
    this.selectedMenu = null;
    this.menuForm.reset({ isActive: true });
  }

  saveMenu(): void {
    if (this.menuForm.invalid || !this.hasSuperAdminAccess || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const formValue = this.menuForm.value;
    
    if (this.selectedMenu) {
      // Update existing menu
      const updateData: MenuUpdateRequest = {
        name: formValue.name,
        path: formValue.path,
        displayOrder: formValue.displayOrder,
        description: formValue.description,
        isActive: formValue.isActive,
        icon: formValue.icon
      };
      
      const sub = this.menuService.updateMenu(this.selectedMenu.id, updateData).subscribe({
        next: () => {
          this.toastService.showSuccess('Menu updated successfully');
          this.loadMenuStatistics();
          this.closeMenuModal();
          this.isSaving = false;
        },
        error: (error) => {
          this.toastService.showError('Failed to update menu');
          this.isSaving = false;
        }
      });
      this.subscriptions.push(sub);
    } else {
      // Create new menu
      const createData: MenuCreateRequest = {
        name: formValue.name,
        path: formValue.path,
        displayOrder: formValue.displayOrder,
        description: formValue.description,
        isActive: formValue.isActive,
        icon: formValue.icon,
        parentMenuId: formValue.parentMenuId
      };
      
      const sub = this.menuService.createMenu(createData).subscribe({
        next: () => {
          this.toastService.showSuccess('Menu created successfully');
          this.loadMenuStatistics();
          this.closeMenuModal();
          this.isSaving = false;
        },
        error: (error) => {
          this.toastService.showError('Failed to create menu');
          this.isSaving = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  openDeleteModal(menu: Menu): void {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.selectedMenuForDelete = menu;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedMenuForDelete = null;
  }

  deleteMenu(): void {
    if (!this.selectedMenuForDelete || !this.hasSuperAdminAccess || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    const sub = this.menuService.deleteMenu(this.selectedMenuForDelete.id).subscribe({
      next: () => {
        this.toastService.showSuccess('Menu deleted successfully');
        this.loadMenuStatistics();
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (error) => {
        this.toastService.showError('Failed to delete menu');
        this.isDeleting = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // Menu ordering operations
  moveMenu(menu: Menu, direction: 'up' | 'down'): void {
    if (this.isMoving || !this.hasSuperAdminAccess) {
      return;
    }
    this.isMoving = true;
    
    const moveOperation = direction === 'up' 
      ? this.menuService.moveMenuUp(menu.id) 
      : this.menuService.moveMenuDown(menu.id);

    const sub = moveOperation.subscribe({
      next: () => {
        this.toastService.showSuccess(`Menu moved ${direction} successfully`);
        this.isMoving = false;
      },
      error: (error) => {
        this.toastService.showError(`Failed to move menu ${direction}`);
        this.isMoving = false;
      }
    });

    this.subscriptions.push(sub);
  }

  onDrop(event: CdkDragDrop<Menu[]>): void {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }

    moveItemInArray(this.filteredMenus, event.previousIndex, event.currentIndex);
    
    // Create new order array
    const newOrder = this.filteredMenus.map(menu => menu.id);
    
    this.isMoving = true;

    const sub = this.menuService.reorderMenus(newOrder).subscribe({
      next: () => {
        this.toastService.showSuccess('Menu order updated');
        this.isMoving = false;
      },
      error: (err) => {
        this.toastService.showError('Failed to update menu order');
        this.filteredMenus = this.menus;
        this.isMoving = false;
      }
    });
    this.subscriptions.push(sub);
  }

  // Menu status operations
  toggleMenuStatus(menu: Menu): void {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }

    const toggleOperation = menu.isActive
      ? this.menuService.deactivateMenu(menu.id)
      : this.menuService.activateMenu(menu.id);

    const sub = toggleOperation.subscribe({
      next: () => {
        const newStatus = !menu.isActive ? 'activated' : 'deactivated';
        this.toastService.showSuccess(`Menu ${newStatus} successfully`);
        this.loadMenuStatistics();
      },
      error: (err) => {
        this.toastService.showError('Failed to update menu status');
      }
    });

    this.subscriptions.push(sub);
  }

  // Role-Menu management
  openRoleModal(menu: Menu): void {
    if (!this.hasSuperAdminAccess) {
      this.toastService.showError('Insufficient permissions');
      return;
    }
    this.selectedMenuForRole = menu;
    this.selectedRoleId = null;
    this.showRoleModal = true;
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.selectedMenuForRole = null;
    this.selectedRoleId = null;
  }

  assignMenuToRole(): void {
    if (!this.selectedMenuForRole || this.selectedRoleId === null || !this.hasSuperAdminAccess) {
      this.toastService.showError('Invalid selection or insufficient permissions');
      return;
    }
    this.isSaving = true;
    const sub = this.roleService.setMenusForRole(this.selectedRoleId, [this.selectedMenuForRole.id]).subscribe({
      next: () => {
        this.toastService.showSuccess(`Menu assigned to role successfully`);
        this.closeRoleModal();
        this.isSaving = false;
      },
      error: (error: any) => {
        this.toastService.showError('Failed to assign menu to role');
        this.isSaving = false;
        console.error('Error assigning menu to role:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  // Bulk operations
  toggleMenuSelection(menuId: number): void {
    if (this.selectedMenuIds.has(menuId)) {
      this.selectedMenuIds.delete(menuId);
    } else {
      this.selectedMenuIds.add(menuId);
    }
  }

  toggleAllMenus(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.filteredMenus.forEach(menu => this.selectedMenuIds.add(menu.id));
    } else {
      this.selectedMenuIds.clear();
    }
  }

  bulkToggleStatus(activate: boolean): void {
    if (!this.hasSuperAdminAccess || this.selectedMenuIds.size === 0) {
      this.toastService.showError('Select menus and ensure you have proper permissions');
      return;
    }

    const operations = Array.from(this.selectedMenuIds).map(menuId => 
      activate ? this.menuService.activateMenu(menuId) : this.menuService.deactivateMenu(menuId)
    );

    Promise.all(operations).then(() => {
      this.toastService.showSuccess(`Menus ${activate ? 'activated' : 'deactivated'} successfully`);
      this.selectedMenuIds.clear();
      this.loadMenuStatistics();
    }).catch(error => {
      this.toastService.showError('Failed to update menu statuses');
    });
  }

  // Search and filter
  onSearch(): void {
    if (this.searchTerm.trim()) {
      const sub = this.menuService.searchMenus(this.searchTerm).subscribe({
        next: (menus) => {
          this.filteredMenus = menus;
        },
        error: (error) => {
          console.error('Error searching menus:', error);
        }
      });
      this.subscriptions.push(sub);
    } else {
      this.applyFilters();
    }
  }

  applyFilters(): void {
    let filtered = this.menus;

    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(menu => menu.isActive);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(menu => !menu.isActive);
    }

    this.filteredMenus = filtered;
  }

  // Utility methods
  hasStatistics(): boolean {
    return this.menuStatistics && this.menuStatistics.totalMenus !== undefined;
  }

  formatMenuName(menuName: string): string {
    return this.menuService.formatMenuName(menuName);
  }

  getMenuTypeColor(menu: Menu): string {
    return this.menuService.getMenuTypeColor(menu);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getNextDisplayOrder(): number {
    if (this.menus.length === 0) return 1;
    return Math.max(...this.menus.map(menu => menu.displayOrder)) + 1;
  }

  // Track by functions for performance
  trackByMenuId(index: number, menu: Menu): number {
    return menu.id;
  }

  trackByRoleId(index: number, role: Role): number {
    return role.id;
  }
} 