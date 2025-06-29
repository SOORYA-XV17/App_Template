import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MenuService, SidebarItem } from '../../services/menu.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class]="'fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ' + 
                    (isSidebarOpen ? 'w-64' : 'w-16')">
      <div class="bg-gray-50 w-full h-full border-r border-gray-200 flex flex-col">
        <!-- Logo Section -->
        <div class="h-16 flex items-center justify-center border-b border-gray-200 bg-white">
          <div *ngIf="isSidebarOpen" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="material-icons text-white text-sm">business</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Dashboard</span>
          </div>
          <div *ngIf="!isSidebarOpen" class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="material-icons text-white text-sm">business</span>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <!-- Loading State -->
          <div *ngIf="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>

          <!-- Menu Items -->
          <div *ngIf="!loading">
            <ng-container *ngFor="let item of sidebarItems">
              <!-- Parent Menu Item -->
              <div class="mb-2">
                <a [routerLink]="item.route"
                   [class]="'sidebar-link ' + (item.active ? 'active' : '')"
                   routerLinkActive="active"
                   (click)="item.children && item.children.length > 0 ? toggleExpanded(item.id) : null"
                   class="flex items-center justify-between">
                  <div class="flex items-center">
                    <span class="material-icons text-xl">{{ item.icon && item.icon.trim() ? item.icon : 'menu' }}</span>
                    <span *ngIf="isSidebarOpen" class="text-sm font-medium ml-2">{{ item.label && item.label.trim() ? item.label : 'Menu' }}</span>
                  </div>
                  <!-- Expand/Collapse arrow for items with children -->
                  <span *ngIf="isSidebarOpen && item.children && item.children.length > 0" 
                        class="material-icons text-sm transition-transform"
                        [class.rotate-90]="expandedItems.has(item.id)">
                    expand_more
                  </span>
                </a>

                <!-- Child Menu Items -->
                <div *ngIf="isSidebarOpen && item.children && item.children.length > 0 && expandedItems.has(item.id)"
                     class="ml-6 mt-2 space-y-1">
                  <a *ngFor="let child of item.children"
                     [routerLink]="child.route"
                     [class]="'sidebar-link-child ' + (child.active ? 'active' : '')"
                     routerLinkActive="active"
                     class="flex items-center pl-4">
                    <span class="material-icons text-sm">{{ child.icon && child.icon.trim() ? child.icon : 'menu' }}</span>
                    <span class="text-sm font-medium ml-2">{{ child.label && child.label.trim() ? child.label : 'Menu' }}</span>
                  </a>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && sidebarItems.length === 0" class="text-center py-8">
            <div class="text-gray-400 mb-2">
              <span class="material-icons text-2xl">menu</span>
            </div>
            <p class="text-xs text-gray-500">No menus available</p>
          </div>
        </nav>

        <!-- User Profile Section -->
        <div class="p-4 border-t border-gray-200 bg-white">
          <div *ngIf="isSidebarOpen" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {{ currentUser.avatarLetter }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ currentUser.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ currentUser.role }}</p>
            </div>
          </div>
          <div *ngIf="!isSidebarOpen" class="flex justify-center">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {{ currentUser.avatarLetter }}
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: #374151;
      transition: all 0.15s ease;
      text-decoration: none;
      font-weight: 500;
    }

    .sidebar-link:hover {
      background-color: #f3f4f6;
      transform: translateX(2px);
    }

    .sidebar-link.active {
      background-color: #eff6ff;
      color: #2563eb;
      border-right: 2px solid #2563eb;
    }

    .sidebar-link-child {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: #6b7280;
      transition: all 0.15s ease;
      text-decoration: none;
      font-weight: 400;
      font-size: 0.875rem;
    }

    .sidebar-link-child:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .sidebar-link-child.active {
      background-color: #eff6ff;
      color: #2563eb;
    }

    /* Custom scrollbar */
    nav::-webkit-scrollbar {
      width: 4px;
    }

    nav::-webkit-scrollbar-track {
      background: transparent;
    }

    nav::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 2px;
    }

    nav::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isSidebarOpen: boolean = true;
  @Input() currentUser: any = {
    name: 'User',
    role: 'User',
    avatarLetter: 'U'
  };

  @Output() sidebarToggle = new EventEmitter<void>();

  sidebarItems: SidebarItem[] = [];
  loading = true;
  expandedItems = new Set<number>();
  private subscription = new Subscription();

  constructor(
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSidebarMenus();
    this.subscribeToRouteChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadSidebarMenus() {
    this.loading = true;
    console.log('Sidebar: Starting to load menus...');
    
    this.menuService.initializeSidebar().subscribe({
      next: (menus) => {
        console.log('Sidebar: Successfully loaded menus:', menus);
        this.sidebarItems = menus;
        this.loading = false;
        this.setActiveMenuFromCurrentRoute();
        this.expandParentIfChildActive();
      },
      error: (error) => {
        console.error('Sidebar: Failed to load sidebar menus:', error);
        this.loading = false;
        // Fallback menus are already set in the service
        this.sidebarItems = this.menuService.getCurrentSidebarMenus();
        console.log('Sidebar: Using fallback menus:', this.sidebarItems);
        this.expandParentIfChildActive();
      }
    });
  }

  private subscribeToRouteChanges() {
    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.setActiveMenuFromCurrentRoute();
      })
    );
  }

  private setActiveMenuFromCurrentRoute() {
    const currentRoute = this.router.url;
    this.menuService.setActiveMenu(currentRoute);
    this.sidebarItems = this.menuService.getCurrentSidebarMenus();
    this.expandParentIfChildActive();
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleExpanded(itemId: number) {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  // Auto-expand parent when child is active
  private expandParentIfChildActive() {
    this.sidebarItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.active);
        if (hasActiveChild) {
          this.expandedItems.add(item.id);
        }
      }
    });
  }
} 