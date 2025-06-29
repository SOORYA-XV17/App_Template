import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MenuService, SidebarItem } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class]="'fixed top-16 left-0 z-[60] h-[calc(100vh-4rem)] w-64 bg-[#0d2a66] border-r border-gray-200 transition-transform duration-300 ease-in-out transform ' + (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0 lg:static lg:inset-0'">
      <div class="flex flex-col h-full">
        <!-- Mobile Toggle Button -->
        <div class="lg:hidden flex justify-end p-4">
          <button
            (click)="toggleSidebar()"
            class="text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
          >
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto px-4 pb-4" [class.pt-4]="!isSidebarOpen">
          <!-- Loading State -->
          <div *ngIf="loading" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>

          <!-- Menu Items -->
          <div *ngIf="!loading" class="space-y-2">
            <ng-container *ngFor="let item of sidebarItems">
              <!-- Main Menu Item -->
              <div class="group">
                <a *ngIf="!item.subItems || item.subItems.length === 0"
                   [routerLink]="item.route"
                   routerLinkActive="active"
                   class="sidebar-link flex items-center px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group-hover:translate-x-1"
                >
                  <span class="material-icons text-lg mr-3">{{ item.icon && item.icon.trim() ? item.icon : 'menu' }}</span>
                  <span *ngIf="isSidebarOpen" class="text-sm font-medium">{{ item.label && item.label.trim() ? item.label : 'Menu' }}</span>
                </a>

                <!-- Menu Item with Submenu -->
                <button *ngIf="item.subItems && item.subItems.length > 0"
                        (click)="item.subItems && item.subItems.length > 0 ? toggleExpanded(item.id) : null"
                        class="sidebar-link w-full flex items-center justify-between px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200 group-hover:translate-x-1"
                >
                  <div class="flex items-center">
                    <span class="material-icons text-lg mr-3">{{ item.icon && item.icon.trim() ? item.icon : 'menu' }}</span>
                    <span *ngIf="isSidebarOpen" class="text-sm font-medium">{{ item.label && item.label.trim() ? item.label : 'Menu' }}</span>
                  </div>
                  <span *ngIf="isSidebarOpen && item.subItems && item.subItems.length > 0" 
                        class="material-icons text-sm transition-transform duration-200"
                        [class.rotate-180]="expandedItems.has(item.id)">
                    keyboard_arrow_down
                  </span>
                </button>

                <!-- Submenu Items -->
                <div *ngIf="isSidebarOpen && item.subItems && item.subItems.length > 0 && expandedItems.has(item.id)"
                     class="ml-6 mt-2 space-y-1 border-l-2 border-white/20 pl-4">
                  <a *ngFor="let child of item.subItems"
                     [routerLink]="child.route"
                     routerLinkActive="active"
                     class="sidebar-link-child flex items-center px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  >
                    <span class="material-icons text-sm mr-2">{{ child.icon && child.icon.trim() ? child.icon : 'subdirectory_arrow_right' }}</span>
                    <span class="text-sm">{{ child.label && child.label.trim() ? child.label : 'Menu' }}</span>
                  </a>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- Empty State -->
          <div *ngIf="!loading && sidebarItems.length === 0" class="text-center py-8">
            <div class="text-white/60 mb-2">
              <span class="material-icons text-2xl">menu</span>
            </div>
            <p class="text-xs text-white/60">No menus available</p>
          </div>
        </nav>

        <!-- User Profile Section -->
        <div class="p-4 border-t border-white/20 bg-[#0d2a66]">
          <div *ngIf="isSidebarOpen" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              {{ currentUser.avatarLetter }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white truncate">{{ currentUser.name }}</p>
              <p class="text-xs text-white/60 truncate">{{ currentUser.role }}</p>
            </div>
          </div>
          <div *ngIf="!isSidebarOpen" class="flex justify-center">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
              {{ currentUser.avatarLetter }}
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-link {
      position: relative;
    }

    .sidebar-link.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .sidebar-link.active::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background-color: white;
      border-radius: 0 2px 2px 0;
    }

    .sidebar-link-child.active {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
    }

    /* Custom scrollbar */
    nav::-webkit-scrollbar {
      width: 4px;
    }

    nav::-webkit-scrollbar-track {
      background: transparent;
    }

    nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Rotation animation */
    .rotate-180 {
      transform: rotate(180deg);
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
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subscribeToMenuUpdates();
    this.loadSidebarMenus();
    this.subscribeToRouteChanges();
    
    // Add global method for testing
    (window as any).refreshSidebar = () => {
      console.log('Global refresh triggered from console');
      this.forceRefreshFromBackend();
    };
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    // Clean up global method
    delete (window as any).refreshSidebar;
  }

  loadSidebarMenus() {
    this.loading = true;
    console.log('Sidebar: Requesting initial menu load from service...');
    
    // The service now handles initial loading in its constructor.
    // We just need to listen to the stream.
    // If the stream already has data, our subscription will pick it up.
    // If not, it will update once the service's async load completes.
    
    // We can trigger a refresh here to be sure, especially for scenarios like re-login.
    this.menuService.refreshSidebar().subscribe({
        next: () => {
          console.log('Sidebar: Menu refresh request complete. Component will update via subscription.');
        },
        error: (err) => {
          console.error('Sidebar: Menu refresh failed.', err);
          this.loading = false;
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

  /**
   * Subscribe to real-time menu updates from the service
   */
  private subscribeToMenuUpdates() {
    this.subscription.add(
      this.menuService.sidebarMenus$.subscribe({
        next: (menus) => {
          console.log('--- Sidebar: Menu Update Received ---');
          if (menus && menus.length > 0) {
            console.log(`Sidebar: Received ${menus.length} menu items from service. Creating new array to force update.`);
            this.sidebarItems = [...menus]; // Create a new array instance
          } else {
            console.log('Sidebar: Received empty or null menu list. Displaying empty state.');
            this.sidebarItems = [];
          }
          
          this.loading = false;
          this.setActiveMenuFromCurrentRoute();
          this.expandParentIfChildActive();
          this.changeDetectorRef.detectChanges(); // Ensure view updates
        },
        error: (error) => {
          console.error('Sidebar: Error in menu updates subscription:', error);
          this.loading = false;
          this.sidebarItems = [];
          this.changeDetectorRef.detectChanges();
        }
      })
    );
  }

  /**
   * This is a manual refresh trigger for debugging or specific UI actions.
   * It forces the service to fetch the latest data from the backend.
   */
  forceRefreshFromBackend() {
    this.loading = true;
    console.log('Sidebar: Forcing a manual refresh from backend...');
    this.subscription.add(
      this.menuService.refreshSidebar().subscribe({
        next: (items) => {
          console.log(`Sidebar: Manual refresh successful, received ${items.length} items.`);
          // The main subscription will handle the UI update.
          this.loading = false;
        },
        error: (err) => {
          console.error('Sidebar: Manual refresh failed.', err);
          this.loading = false;
          this.changeDetectorRef.detectChanges();
        }
      })
    );
  }

  private setActiveMenuFromCurrentRoute() {
    const currentRoute = this.router.url;
    this.menuService.setActiveMenu(currentRoute);
    // Don't override sidebarItems - let the subscription handle the data
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

  // Auto-expand parent when child is active (using route matching)
  private expandParentIfChildActive() {
    const currentRoute = this.router.url;
    this.sidebarItems.forEach(item => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(child => 
          currentRoute.startsWith(child.route) || child.route === currentRoute
        );
        if (hasActiveChild) {
          this.expandedItems.add(item.id);
        }
      }
    });
  }
} 