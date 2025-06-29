import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MenuService, SidebarItem } from '../../services/menu.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface UserData {
  name: string;
  email: string;
  role: string;
  avatarLetter: string;
}

interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: Date;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <!-- Main Layout Container -->
    <div class="min-h-screen bg-gray-50">
      <!-- Professional Navbar -->
      <nav class="bg-[#0d2a66] px-4 py-4 border-b border-[rgba(255,255,255,0.2)] shadow-lg relative z-50">
        <div class="flex items-center justify-between">
          <!-- Left: Logo/Brand -->
          <div class="flex items-center">
            <button (click)="toggleSidebar()" 
                    class="lg:hidden p-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-lg mr-4 transition-all duration-300">
              <span class="material-icons">menu</span>
            </button>
            <div class="flex items-center pl-2.5">
              <img src="LOGO_HYUNDAI.svg" 
                   alt="Hyundai Logo" 
                   class="h-8 w-auto mr-3">
            </div>
          </div>

          <!-- Right: User Dropdown -->
          <div class="flex items-center">
            <!-- User Dropdown -->
            <div class="relative">
              <button (click)="toggleUserDropdown()" 
                      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all duration-300">
                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span class="text-sm font-semibold text-[#0d2a66]">{{ currentUser.avatarLetter }}</span>
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-white">User</p>
                  <p class="text-xs text-gray-300">{{ currentUser.email || currentUser.name }}</p>
                </div>
                <span class="material-icons text-white text-lg transform transition-transform duration-200"
                      [class.rotate-180]="isUserDropdownOpen">expand_more</span>
              </button>

              <!-- User Dropdown Menu -->
              <div *ngIf="isUserDropdownOpen" 
                   class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] py-2 z-50">
                <a routerLink="/profile" 
                   (click)="closeUserDropdown()"
                   class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                  <span class="material-icons text-gray-400 mr-3">person</span>
                  Profile
                </a>
                <a routerLink="/settings" 
                   (click)="closeUserDropdown()"
                   class="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200">
                  <span class="material-icons text-gray-400 mr-3">settings</span>
                  Settings
                </a>
                <hr class="my-2 border-gray-200">
                <button (click)="onLogout()" 
                        class="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200">
                  <span class="material-icons text-red-500 mr-3">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Mobile Backdrop -->
      <div *ngIf="isMobileSidebarOpen" 
           (click)="closeMobileSidebar()"
           class="fixed inset-0 bg-black bg-opacity-50 z-[55] lg:hidden"></div>

      <!-- Professional Sidebar -->
      <aside [class]="'fixed left-0 w-64 bg-[#0d2a66] text-white font-outfit transform transition-transform duration-300 ease-cubic z-[60] ' +
                      'top-22 h-[calc(100vh-5.5rem)] lg:top-1 lg:h-[calc(100vh-0.25rem)] ' +
                      (isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' lg:translate-x-0'">
        <div class="h-full flex flex-col overflow-hidden">
          <!-- Sidebar Header (hidden on mobile as navbar shows logo) -->
          <div class="hidden lg:flex items-center px-6 py-6 border-b border-[rgba(255,255,255,0.1)]">
            <img src="LOGO_HYUNDAI.svg" 
                 alt="Hyundai Logo" 
                 class="h-8 w-auto">
          </div>

          <!-- Navigation Items -->
          <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto sidebar-scroll">
            <!-- Dashboard -->
            <a routerLink="/dashboard" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">dashboard</span>
              Dashboard
            </a>

            <!-- User Management with Dropdown -->
            <div class="mx-2 mb-1">
              <button (click)="toggleDropdown('users')" 
                      class="nav-item w-full flex items-center justify-between px-3 py-4 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
                <div class="flex items-center">
                  <span class="material-icons mr-3 text-xl">group</span>
                  User Management
                </div>
                <span class="material-icons text-lg transform transition-transform duration-200"
                      [class.rotate-180]="openDropdowns.has('users')">expand_more</span>
              </button>
              
              <!-- Sub-item -->
              <div *ngIf="openDropdowns.has('users')" 
                   class="ml-3 mt-1 transition-all duration-200">
                <a routerLink="/subdashsds35b5oa4rd" 
                   routerLinkActive="nav-active"
                   class="nav-item flex items-center px-6 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1">
                  <span class="material-icons mr-3 text-base">dashboard</span>
                  Sub Dashboard
                </a>
              </div>
            </div>

            <!-- Role Management -->
            <a routerLink="/roles" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">shield</span>
              Role Management
            </a>

            <!-- Menu Management -->
            <a routerLink="/menus" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">menu</span>
              Menu Management
            </a>

            <!-- Code Management -->
            <a routerLink="/code_mangement" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">code</span>
              Code Management
            </a>

            <!-- Reports -->
            <a routerLink="/reports" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">assessment</span>
              Reports
            </a>

            <!-- Settings -->
            <a routerLink="/settings" 
               routerLinkActive="nav-active"
               class="nav-item flex items-center px-3 py-4 mx-2 mb-1 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:transform hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(255,255,255,0.1)]">
              <span class="material-icons mr-3 text-xl">settings</span>
              Settings
            </a>
          </nav>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="lg:ml-64 min-h-screen">
        <!-- Page Content Slot -->
        <main class="min-h-screen">
          <ng-content></ng-content>
        </main>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="fixed top-4 right-4 z-50 space-y-4">
      <div *ngFor="let notification of notifications" 
           [class]="'p-4 rounded-lg shadow-lg flex items-start max-w-sm transition-all duration-300 ' +
                    (notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                     notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                     'bg-blue-50 border-l-4 border-blue-500')">
        <div class="flex-1">
          <p [class]="'text-sm font-medium ' +
                      (notification.type === 'success' ? 'text-green-800' :
                       notification.type === 'error' ? 'text-red-800' :
                       'text-blue-800')">
            {{ notification.message }}
          </p>
          <p class="text-xs text-gray-500 mt-1">{{ formatTimeAgo(notification.timestamp) }}</p>
        </div>
        <button (click)="dismissNotification(notification.id)" 
                class="ml-3 p-1 hover:bg-white hover:bg-opacity-50 rounded">
          <span class="material-icons text-sm text-gray-400">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ease-cubic {
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-scroll::-webkit-scrollbar {
      display: none;
    }

    .sidebar-scroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .nav-active {
      background: rgba(255, 255, 255, 0.2) !important;
      transform: translateX(4px) !important;
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
      position: relative;
    }

    .nav-active::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: white;
      border-radius: 2px;
    }

    .notification-badge {
      background: #ef4444;
      border-radius: 9999px;
      height: 20px;
      font-size: 11px;
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  @Input() pageTitle: string = 'Dashboard';
  @Input() isSidebarOpen: boolean = true;
  @Input() notifications: NotificationItem[] = [];

  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() notificationDismiss = new EventEmitter<string>();

  currentUser: UserData = {
    name: 'User',
    email: 'user@example.com',
    role: 'User',
    avatarLetter: 'U'
  };

  isUserDropdownOpen = false;
  isMobileSidebarOpen = false;
  openDropdowns = new Set<string>();

  private userSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Subscribe to user updates
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = {
          name: user.username,
          email: user.email,
          role: user.roles?.[0] || 'User',
          avatarLetter: user.avatarLetter || user.username.charAt(0).toUpperCase()
        };
      }
    });

    // Load initial user data
    this.userService.loadUserProfile().subscribe();

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        this.isUserDropdownOpen = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    this.sidebarToggle.emit();
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown() {
    this.isUserDropdownOpen = false;
  }

  toggleDropdown(key: string) {
    if (this.openDropdowns.has(key)) {
      this.openDropdowns.delete(key);
    } else {
      this.openDropdowns.add(key);
    }
  }

  onLogout() {
    this.closeUserDropdown();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  dismissNotification(id: string) {
    this.notificationDismiss.emit(id);
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
  }
} 