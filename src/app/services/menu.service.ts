import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Menu interfaces matching backend response
export interface Menu {
  id: number;
  name: string;
  path: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  icon?: string;
  parentMenu?: Menu;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  version?: number;
}

export interface MenuCreateRequest {
  name: string;
  path: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  icon?: string;
  parentMenuId?: number;
}

export interface MenuUpdateRequest {
  name: string;
  path: string;
  displayOrder?: number;
  description?: string;
  isActive?: boolean;
  icon?: string;
}

export interface RoleMenuResponse {
  role: string;
  menus: Menu[];
  count: number;
}

export interface MenuStatistics {
  totalMenus: number;
  activeMenus: number;
  inactiveMenus: number;
  rootMenus: number;
  subMenus: number;
  recentMenus: number;
}

// Legacy interface for sidebar (keeping for backward compatibility)
export interface SidebarItem {
  id: number;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  subItems?: SidebarItem[];
  isExpanded?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  private baseUrl = environment.apiUrl;

  // For Sidebar (active menus)
  private sidebarMenusSubject = new BehaviorSubject<SidebarItem[]>([]);
  public sidebarMenus$ = this.sidebarMenusSubject.asObservable();

  // For Menu Management page (all menus)
  private allMenusSubject = new BehaviorSubject<Menu[]>([]);
  public allMenus$ = this.allMenusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('MenuService initialized with base URL:', this.baseUrl);
    // Initial load for both subjects
    this.refreshAllMenus().subscribe();
    this.refreshSidebar().subscribe();
  }

  // ==========================
  // NOTIFICATION & REFRESH
  // ==========================

  /**
   * Notifies all subscribers that a change has occurred in the menu data.
   * This triggers a refresh of both the sidebar menus and the full menu list.
   */
  public notifyMenuChange(): void {
    console.log('MENU_SERVICE: Change detected, refreshing all menu data...');
    // These now return observables that complete, so we can subscribe to them.
    this.refreshSidebar().subscribe();
    this.refreshAllMenus().subscribe();
  }

  /**
   * Fetches the complete list of menus from the backend and updates the allMenus$ stream.
   * This is used by the menu management page.
   */
  public refreshAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus`).pipe(
      tap(menus => {
        const sortedMenus = this.sortMenusByOrder(menus);
        console.log(`MENU_SERVICE: Refreshed all menus. Found ${sortedMenus.length} menus.`);
        this.allMenusSubject.next(sortedMenus);
      }),
      catchError(error => {
        console.error('MENU_SERVICE: Error refreshing all menus:', error);
        this.allMenusSubject.next([]); // Emit empty array on error
        return of([]);
      })
    );
  }

  // ==========================
  // MENU CRUD OPERATIONS
  // ==========================

  /**
   * Get All Menus (ordered by display order)
   * DEPRECATED: Use allMenus$ and refreshAllMenus() instead.
   */
  getAllMenus(): Observable<Menu[]> {
    console.warn('getAllMenus() is deprecated. Please subscribe to allMenus$ instead.');
    return this.http.get<Menu[]>(`${this.baseUrl}/menus`).pipe(
      catchError(error => {
        console.error('Error fetching all menus:', error);
        return of([]);
      })
    );
  }

  /**
   * Get Active Menus Only
   */
  getActiveMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/active`).pipe(
      catchError(error => {
        console.error('Error fetching active menus:', error);
        return of([]);
      })
    );
  }

  /**
   * Get Root Menus (no parent)
   */
  getRootMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/root`).pipe(
      catchError(error => {
        console.error('Error fetching root menus:', error);
        return of([]);
      })
    );
  }

  /**
   * Get Sub-menus for Parent
   */
  getSubMenus(parentId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/${parentId}/submenu`).pipe(
      catchError(error => {
        console.error('Error fetching sub menus:', error);
        return of([]);
      })
    );
  }

  /**
   * Get Single Menu
   */
  getMenuById(id: number): Observable<Menu | null> {
    return this.http.get<Menu>(`${this.baseUrl}/menus/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching menu by ID:', error);
        return of(null);
      })
    );
  }

  /**
   * Get Menu Debug Info
   */
  getMenuDebugInfo(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/menus/${id}/debug`).pipe(
      catchError(error => {
        console.error('Error fetching menu debug info:', error);
        return of(null);
      })
    );
  }

  /**
   * Create New Menu
   */
  createMenu(menuData: MenuCreateRequest): Observable<Menu | null> {
    return this.http.post<Menu>(`${this.baseUrl}/menus`, menuData).pipe(
      tap(() => {
        console.log('Menu created successfully, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error creating menu:', error);
        throw error;
      })
    );
  }

  /**
   * Update Menu
   */
  updateMenu(id: number, menuData: MenuUpdateRequest): Observable<Menu | null> {
    return this.http.put<Menu>(`${this.baseUrl}/menus/${id}`, menuData).pipe(
      tap(() => {
        console.log('Menu updated successfully, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error updating menu:', error);
        throw error;
      })
    );
  }

  /**
   * Delete Menu by ID
   */
  deleteMenu(id: number): Observable<boolean> {
    return this.http.delete(`${this.baseUrl}/menus/${id}`, { 
      responseType: 'text' 
    }).pipe(
      map((response: string) => {
        console.log('Delete response:', response);
        return true;
      }),
      tap(() => {
        console.log('Menu deleted successfully, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error deleting menu:', error);
        throw error;
      })
    );
  }

  // ==========================
  // MENU ORDERING OPERATIONS
  // ==========================

  /**
   * Move Menu Up
   */
  moveMenuUp(id: number): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/${id}/move-up`, {}, { 
      responseType: 'text' 
    }).pipe(
      map((response: string) => {
        console.log('Move up response:', response);
        return true;
      }),
      tap(() => {
        console.log('Menu moved up successfully, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error moving menu up:', error);
        throw error;
      })
    );
  }

  /**
   * Move Menu Down
   */
  moveMenuDown(id: number): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/${id}/move-down`, {}, { 
      responseType: 'text' 
    }).pipe(
      map((response: string) => {
        console.log('Move down response:', response);
        return true;
      }),
      tap(() => {
        console.log('Menu moved down successfully, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error moving menu down:', error);
        throw error;
      })
    );
  }

  /**
   * Move Menu to specific position
   */
  moveMenuToPosition(id: number, position: number): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/${id}/move-to/${position}`, {}, { 
      responseType: 'text' 
    }).pipe(
      map((response: string) => {
        console.log('Move to position response:', response);
        return true;
      }),
      tap(() => {
        console.log('Menu moved to position, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error moving menu to position:', error);
        throw error;
      })
    );
  }

  /**
   * Bulk Reorder Menus
   */
  reorderMenus(menuIds: number[]): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/reorder`, { menuIds }, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log("Reorder response: ", response);
        return true;
      }),
      tap(() => {
        console.log('Menus reordered, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error reordering menus:', error);
        throw error;
      })
    );
  }

  /**
   * Activate Menu
   */
  activateMenu(id: number): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/${id}/activate`, {}, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log("Activate response:", response);
        return true;
      }),
      tap(() => {
        console.log('Menu activated, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error activating menu:', error);
        throw error;
      })
    );
  }

  /**
   * Deactivate Menu
   */
  deactivateMenu(id: number): Observable<boolean> {
    return this.http.put(`${this.baseUrl}/menus/${id}/deactivate`, {}, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        console.log("Deactivate response:", response);
        return true;
      }),
      tap(() => {
        console.log('Menu deactivated, notifying subscribers.');
        this.notifyMenuChange();
      }),
      catchError(error => {
        console.error('Error deactivating menu:', error);
        throw error;
      })
    );
  }

  // ==========================
  // MENU STATISTICS & ROLES
  // ==========================

  /**
   * Get Menu Statistics from backend
   */
  getMenuStatistics(): Observable<MenuStatistics> {
    // Reverted to client-side calculation to avoid backend 400 error.
    // This is more efficient as it uses the existing data stream.
    return this.allMenus$.pipe(
      map(menus => {
        if (!menus || menus.length === 0) {
          return { totalMenus: 0, activeMenus: 0, inactiveMenus: 0, rootMenus: 0, subMenus: 0, recentMenus: 0 };
        }

        const totalMenus = menus.length;
        const activeMenus = menus.filter(menu => menu.isActive).length;
        const inactiveMenus = totalMenus - activeMenus;
        const rootMenus = menus.filter(menu => !menu.parentMenu).length;
        const subMenus = totalMenus - rootMenus;
        
        // Calculate recent menus (created in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentMenus = menus.filter(menu => 
          menu.createdAt && new Date(menu.createdAt) > sevenDaysAgo
        ).length;

        return {
          totalMenus,
          activeMenus,
          inactiveMenus,
          rootMenus,
          subMenus,
          recentMenus
        };
      }),
      catchError(error => {
        console.error('Error calculating menu statistics:', error);
        return of({ totalMenus: 0, activeMenus: 0, inactiveMenus: 0, rootMenus: 0, subMenus: 0, recentMenus: 0 });
      })
    );
  }

  /**
   * Search menus by term
   */
  searchMenus(searchTerm: string): Observable<Menu[]> {
    return this.allMenus$.pipe(
      map(menus => menus.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ))
    );
  }

  // ==========================
  // LEGACY SIDEBAR METHODS (for backward compatibility)
  // ==========================

  initializeSidebar(): Observable<SidebarItem[]> {
    console.log('MENU_SERVICE: Initializing sidebar...');
    return this.refreshSidebar();
  }

  /**
   * Get current sidebar menus (snapshot)
   */
  getCurrentSidebarMenus(): SidebarItem[] {
    return this.sidebarMenusSubject.getValue();
  }

  /**
   * Set the currently active menu in the sidebar based on route
   */
  setActiveMenu(route: string): void {
    const currentItems = this.getCurrentSidebarMenus();
    this.updateActiveStates(currentItems, route);
    this.sidebarMenusSubject.next([...currentItems]);
  }

  /**
   * Fetches active menus from the backend, converts them to SidebarItem[],
   * and updates the sidebarMenus$ stream.
   */
  refreshSidebar(): Observable<SidebarItem[]> {
    console.log('MENU_SERVICE: Refreshing sidebar menus...');
    return this.getActiveMenus().pipe(
      map(menus => {
        console.log(`MENU_SERVICE: Fetched ${menus.length} active menus for sidebar.`);
        const sidebarItems = this.convertMenusToSidebarItems(menus);
        console.log(`MENU_SERVICE: Converted to ${sidebarItems.length} sidebar items.`);
        this.sidebarMenusSubject.next(sidebarItems);
        return sidebarItems;
      }),
      catchError(error => {
        console.error('MENU_SERVICE: Error refreshing sidebar:', error);
        this.sidebarMenusSubject.next(this.getDefaultSidebarItems()); // Fallback to default
        return of([]);
      })
    );
  }

  private convertMenusToSidebarItems(menus: Menu[]): SidebarItem[] {
    console.log('MenuService: Converting menus to sidebar items:', menus);
    
    // Filter for root menus (no parentMenu or parentMenu is null)
    const rootMenus = menus.filter(menu => !menu.parentMenu);
    console.log('MenuService: Root menus found:', rootMenus);

    const sidebarItems = rootMenus.map(menu => {
      const subItems = this.getSubItemsForMenu(menu.id, menus);
      console.log(`MenuService: Sub items for ${menu.name}:`, subItems);
      
      return {
        id: menu.id,
        label: this.formatMenuName(menu.name),
        icon: this.mapIconToMaterialIcon(menu.icon || 'menu_book'),
        route: menu.path,
        subItems: subItems.length > 0 ? subItems : undefined
      };
    }).sort((a, b) => {
      const orderA = menus.find(m => m.id === a.id)?.displayOrder ?? 0;
      const orderB = menus.find(m => m.id === b.id)?.displayOrder ?? 0;
      return orderA - orderB;
    });

    return sidebarItems;
  }

  private getSubItemsForMenu(parentId: number, allMenus: Menu[]): SidebarItem[] {
    const subMenus = allMenus
      .filter(menu => menu.parentMenu?.id === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
      
    return subMenus.map(menu => ({
      id: menu.id,
      label: this.formatMenuName(menu.name),
      icon: this.mapIconToMaterialIcon(menu.icon || 'subdirectory_arrow_right'),
      route: menu.path
    }));
  }

  private updateActiveStates(items: SidebarItem[], route: string): void {
    items.forEach(item => {
      if (item.route === route) {
        // Set active state logic here if needed
      }
      if (item.subItems) {
        this.updateActiveStates(item.subItems, route);
      }
    });
  }

  private getDefaultSidebarItems(): SidebarItem[] {
    console.log('MenuService: Returning default sidebar items');
    return [
      {
        id: 1,
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/dashboard'
      },
            { 
              id: 2, 
              label: 'User Management', 
        icon: 'group',
              route: '/users',
        subItems: [
          {
            id: 21,
            label: 'Sub Dashboard',
            icon: 'dashboard',
            route: '/subdashsds35b5oa4rd'
          }
        ]
      },
      {
        id: 3,
        label: 'Role Management',
        icon: 'shield',
        route: '/roles'
      },
      {
        id: 4,
        label: 'Menu Management',
        icon: 'menu',
        route: '/menus'
      },
      {
        id: 5,
        label: 'Code Management',
        icon: 'code',
        route: '/code_mangement'
      },
      {
        id: 6,
        label: 'Reports',
        icon: 'assessment',
        route: '/reports'
      },
      {
        id: 7,
        label: 'Settings',
        icon: 'settings',
        route: '/settings'
      }
    ];
  }

  // ==========================
  // UTILITY METHODS
  // ==========================

  /**
   * Map FontAwesome icons from backend to Material Icons for frontend
   */
  private mapIconToMaterialIcon(fontAwesomeIcon: string): string {
    const iconMap: { [key: string]: string } = {
      'fa-tachometer-alt': 'dashboard',
      'fa-users': 'group',
      'fa-user-shield': 'shield',
      'fa-bars': 'menu',
      'fa-chart-bar': 'assessment',
      'fa-cogs': 'settings',
      'fa-list': 'list',
      'fa-box': 'inventory_2',
      'fa-sign-out-alt': 'logout',
      'fa-user-circle': 'account_circle',
      'fa-bell': 'notifications',
      'fa-envelope': 'mail',
      'fa-question-circle': 'help_outline',
      'fa-lock': 'lock',
      'fa-key': 'vpn_key',
      'fa-shield-alt': 'security',
      'fa-sitemap': 'account_tree',
      'fa-file-alt': 'description',
      'fa-code': 'code',
      // Direct mappings for Material Icons
      'dashboard': 'dashboard',
      'group': 'group',
      'shield': 'shield',
      'menu': 'menu',
      'assessment': 'assessment',
      'settings': 'settings',
      'list': 'list',
      'inventory_2': 'inventory_2',
      'logout': 'logout',
      'account_circle': 'account_circle',
      'notifications': 'notifications',
      'mail': 'mail',
      'help_outline': 'help_outline',
      'lock': 'lock',
      'vpn_key': 'vpn_key',
      'security': 'security',
      'account_tree': 'account_tree',
      'description': 'description',
      'code': 'code',
      'menu_book': 'menu_book',
      'subdirectory_arrow_right': 'subdirectory_arrow_right',
      'add': 'add',
      'edit': 'edit',
      'delete': 'delete'
    };
    return iconMap[fontAwesomeIcon.toLowerCase()] || 'apps'; // Fallback icon
  }

  /**
   * Format menu name for display
   */
  formatMenuName(menuName: string): string {
    return menuName.replace(/[-_]/g, ' ').toLowerCase()
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /**
   * Get menu type color based on properties
   */
  getMenuTypeColor(menu: Menu): string {
    if (!menu.isActive) {
      return 'bg-gray-100 text-gray-800';
    } else if (menu.parentMenu) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  }

  /**
   * Sort menus by display order
   */
  sortMenusByOrder(menus: Menu[]): Menu[] {
    return menus.sort((a, b) => a.displayOrder - b.displayOrder);
  }
} 