import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Menu {
  id: number;
  name: string;
  path: string;
  displayOrder: number;
  description?: string;
  isActive: boolean;
  icon?: string;
  parentMenu?: Menu;
}

export interface SidebarItem {
  id: number;
  label: string;
  icon: string;
  route: string;
  active?: boolean;
  children?: SidebarItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseUrl = environment.apiUrl;
  private sidebarMenusSubject = new BehaviorSubject<SidebarItem[]>([]);
  public sidebarMenus$ = this.sidebarMenusSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Load all active menus for sidebar
  loadSidebarMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus`);
  }

  // Load root menus only
  loadRootMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/root`);
  }

  // Load sub-menus for a parent
  loadSubMenus(parentId: number): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.baseUrl}/menus/${parentId}/submenu`);
  }

  // Convert backend Menu to frontend SidebarItem
  convertToSidebarItems(menus: Menu[]): SidebarItem[] {
    return menus
      .filter(menu => menu.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(menu => ({
        id: menu.id,
        label: menu.name,
        icon: menu.icon || 'circle', // Default icon if none provided
        route: menu.path,
        active: false
      }));
  }

  // Build hierarchical sidebar structure
  buildHierarchicalSidebar(menus: Menu[]): SidebarItem[] {
    // Filter for active menus only
    const activeMenus = menus.filter(menu => menu.isActive);
    
    // Get root menus (menus without parentMenu or where parentMenu is null)
    const rootMenus = activeMenus.filter(menu => !menu.parentMenu);
    
    // Get child menus (menus with parentMenu)
    const childMenus = activeMenus.filter(menu => menu.parentMenu);

    return rootMenus
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(menu => {
        const children = childMenus
          .filter(child => child.parentMenu?.id === menu.id)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(child => ({
            id: child.id,
            label: child.name,
            icon: child.icon || 'subdirectory_arrow_right',
            route: child.path,
            active: false
          }));

        return {
          id: menu.id,
          label: menu.name,
          icon: menu.icon || 'circle',
          route: menu.path,
          active: false,
          children: children.length > 0 ? children : undefined
        };
      });
  }

  // Update sidebar menus
  updateSidebarMenus(menus: Menu[]): void {
    const sidebarItems = this.buildHierarchicalSidebar(menus);
    this.sidebarMenusSubject.next(sidebarItems);
  }

  // Get current sidebar menus
  getCurrentSidebarMenus(): SidebarItem[] {
    return this.sidebarMenusSubject.value;
  }

  // Set active menu based on current route
  setActiveMenu(currentRoute: string): void {
    const menus = this.sidebarMenusSubject.value;
    const updatedMenus = this.updateActiveState(menus, currentRoute);
    this.sidebarMenusSubject.next(updatedMenus);
  }

  private updateActiveState(menus: SidebarItem[], currentRoute: string): SidebarItem[] {
    return menus.map(menu => {
      const isActive = menu.route === currentRoute;
      const hasActiveChild = menu.children?.some(child => child.route === currentRoute);

      return {
        ...menu,
        active: isActive || hasActiveChild,
        children: menu.children ? menu.children.map(child => ({
          ...child,
          active: child.route === currentRoute
        })) : undefined
      };
    });
  }

  // Initialize sidebar on app startup
  initializeSidebar(): Observable<SidebarItem[]> {
    return new Observable(observer => {
      console.log('Initializing sidebar, fetching menus from:', `${this.baseUrl}/menus`);
      
      this.loadSidebarMenus().subscribe({
        next: (menus) => {
          console.log('Successfully loaded menus from API:', menus);
          const sidebarItems = this.buildHierarchicalSidebar(menus);
          console.log('Built sidebar items:', sidebarItems);
          this.sidebarMenusSubject.next(sidebarItems);
          observer.next(sidebarItems);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to load sidebar menus from API:', error);
          console.log('Using fallback menus based on API response structure');
          
          // Fallback to menus based on the API response structure you provided
          const fallbackMenus: SidebarItem[] = [
            { id: 1, label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
            { 
              id: 2, 
              label: 'User Management', 
              icon: 'users', 
              route: '/users',
              children: [
                { id: 7, label: 'subdawew2shb4o2a4rd', icon: 'fa-udith', route: '/subdashsds35b5oa4rd' }
              ]
            },
            { id: 3, label: 'Role Management', icon: 'shield', route: '/roles' },
            { id: 4, label: 'Menu Management', icon: 'menu', route: '/menus' },
            { id: 8, label: 'Code Management', icon: 'code', route: '/code_mangement' },
            { id: 5, label: 'Reports', icon: 'chart-bar', route: '/reports' },
            { id: 6, label: 'Settings', icon: 'cog', route: '/settings' }
          ];
          
          this.sidebarMenusSubject.next(fallbackMenus);
          observer.next(fallbackMenus);
          observer.complete();
        }
      });
    });
  }
} 