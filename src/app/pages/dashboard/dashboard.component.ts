import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UserService, UserProfile } from '../../services/user.service';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { HybridEncryptionService } from '../../services/hybrid-encryption.service';
import { DashboardService, DashboardStats, RecentActivity } from '../../services/dashboard.service';
import { Subscription } from 'rxjs';

interface UserData {
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatarLetter: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LayoutWrapperComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoading = true;
  isLoggingOut = false;
  private userSubscription?: Subscription;
  
  // Loading states
  isLoadingStats = true;
  isLoadingActivities = true;
  
  // Error states
  statsError = false;
  activitiesError = false;
  
  // Dynamic data
  dashboardStats: DashboardStats | null = null;
  recentActivities: RecentActivity[] = [];
  
  // Hybrid Encryption Test Properties
  testMessage: string = 'Hello World! This is a test message for hybrid encryption.';
  isEncrypting: boolean = false;
  encryptionResult: string = '';
  encryptionError: string = '';
  
  currentUser: UserData = {
    name: '',
    email: '',
    role: '',
    avatar: '',
    avatarLetter: ''
  };

  ngOnInit() {
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = {
          name: user.username,
          email: user.email,
          role: user.roles[0] || 'User',
          avatar: '',
          avatarLetter: user.avatarLetter
        };
      }
      this.isLoading = false;
    });
    
    // Load dashboard data
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private userService: UserService,
    private hybridEncryptionService: HybridEncryptionService,
    private dashboardService: DashboardService
  ) {}

  loadDashboardStats() {
    this.isLoadingStats = true;
    this.statsError = false;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.statsError = true;
        this.isLoadingStats = false;
        this.dashboardStats = null;
      }
    });
  }

  loadRecentActivities() {
    this.isLoadingActivities = true;
    this.activitiesError = false;
    
    this.dashboardService.getRecentActivities(5).subscribe({
      next: (activities) => {
        this.recentActivities = activities;
        this.isLoadingActivities = false;
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.activitiesError = true;
        this.isLoadingActivities = false;
        this.recentActivities = [];
      }
    });
  }

  getStatCards() {
    if (!this.dashboardStats) return [];
    
    return [
      {
        title: 'Total Users',
        value: this.dashboardStats.totalUsers.toLocaleString(),
        change: `${this.dashboardStats.userGrowth >= 0 ? '+' : ''}${this.dashboardStats.userGrowth}%`,
        changeType: this.dashboardStats.userGrowth >= 0 ? 'increase' : 'decrease',
        icon: 'group',
        color: 'blue'
      },
      {
        title: 'Total Products',
        value: this.dashboardStats.totalProducts.toLocaleString(),
        change: `${this.dashboardStats.productGrowth >= 0 ? '+' : ''}${this.dashboardStats.productGrowth}%`,
        changeType: this.dashboardStats.productGrowth >= 0 ? 'increase' : 'decrease',
        icon: 'inventory',
        color: 'green'
      },
      {
        title: 'Orders Today',
        value: this.dashboardStats.ordersToday.toLocaleString(),
        change: `${this.dashboardStats.orderGrowth >= 0 ? '+' : ''}${this.dashboardStats.orderGrowth}%`,
        changeType: this.dashboardStats.orderGrowth >= 0 ? 'increase' : 'decrease',
        icon: 'shopping_cart',
        color: 'yellow'
      },
      {
        title: 'Revenue',
        value: `$${this.dashboardStats.revenue.toLocaleString()}`,
        change: `${this.dashboardStats.revenueGrowth >= 0 ? '+' : ''}${this.dashboardStats.revenueGrowth}%`,
        changeType: this.dashboardStats.revenueGrowth >= 0 ? 'increase' : 'decrease',
        icon: 'attach_money',
        color: 'purple'
      }
    ];
  }

  formatActivityTime(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  }

  trackByStatTitle(index: number, stat: any): string {
    return stat.title;
  }

  trackByActivityId(index: number, activity: RecentActivity): number {
    return activity.id;
  }

  logout() {
    if (this.isLoggingOut) return;
    
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.showSuccess('Logged out successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.toastService.showError('Failed to logout. Please try again.');
        this.isLoggingOut = false;
      }
    });
  }

  getStatColorClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'text-[#0d2a66]',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    };
    return colorMap[color] || 'text-gray-600';
  }

  getStatBgClass(color: string): string {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-[#0d2a66]/10',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      purple: 'bg-purple-100'
    };
    return colorMap[color] || 'bg-gray-100';
  }

  // Hybrid Encryption Test Methods
  async testEncryption() {
    if (!this.testMessage.trim()) {
      this.encryptionError = 'Please enter a message to encrypt';
      return;
    }

    this.isEncrypting = true;
    this.encryptionResult = '';
    this.encryptionError = '';

    try {
      const result = await this.hybridEncryptionService.performHybridEncryption(this.testMessage);
      this.encryptionResult = result;
      this.toastService.showSuccess('Encryption test completed successfully!');
    } catch (error) {
      console.error('Encryption test failed:', error);
      this.encryptionError = error instanceof Error ? error.message : 'Encryption test failed';
      this.toastService.showError('Encryption test failed. Please check the console for details.');
    } finally {
      this.isEncrypting = false;
    }
  }

  clearTest() {
    this.testMessage = '';
    this.encryptionResult = '';
    this.encryptionError = '';
  }
} 