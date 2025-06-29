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
  private dashboardSubscription?: Subscription;
  private activitiesSubscription?: Subscription;
  
  // Loading states
  isLoadingStats = true;
  isLoadingActivities = true;
  
  // Error states
  statsError = false;
  activitiesError = false;
  
  // Dynamic data from backend
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
    
    // Load dashboard data from backend
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if (this.dashboardSubscription) {
      this.dashboardSubscription.unsubscribe();
    }
    if (this.activitiesSubscription) {
      this.activitiesSubscription.unsubscribe();
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
    
    this.dashboardSubscription = this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.isLoadingStats = false;
        console.log('Dashboard stats loaded:', stats);
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.statsError = true;
        this.isLoadingStats = false;
        this.dashboardStats = null;
        this.toastService.showError('Failed to load dashboard statistics');
      }
    });
  }

  loadRecentActivities() {
    this.isLoadingActivities = true;
    this.activitiesError = false;
    
    this.activitiesSubscription = this.dashboardService.getRecentActivities(5).subscribe({
      next: (activities) => {
        this.recentActivities = activities;
        this.isLoadingActivities = false;
        console.log('Recent activities loaded:', activities);
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.activitiesError = true;
        this.isLoadingActivities = false;
        this.recentActivities = [];
        this.toastService.showError('Failed to load recent activities');
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
        title: 'Active Products',
        value: this.dashboardStats.activeProducts.toLocaleString(),
        change: `${Math.round((this.dashboardStats.activeProducts / this.dashboardStats.totalProducts) * 100)}%`,
        changeType: 'increase',
        icon: 'check_circle',
        color: 'yellow'
      },
      {
        title: 'Average Price',
        value: `$${this.dashboardStats.averagePrice.toFixed(2)}`,
        change: `${this.dashboardStats.revenueGrowth >= 0 ? '+' : ''}${this.dashboardStats.revenueGrowth}%`,
        changeType: this.dashboardStats.revenueGrowth >= 0 ? 'increase' : 'decrease',
        icon: 'attach_money',
        color: 'purple'
      }
    ];
  }

  // Get additional stats for display
  getAdditionalStats() {
    if (!this.dashboardStats) return [];
    
    return [
      {
        label: 'Featured Products',
        value: this.dashboardStats.featuredProducts,
        icon: 'star',
        color: 'text-yellow-600'
      },
      {
        label: 'Categories',
        value: this.dashboardStats.categoryCount,
        icon: 'category',
        color: 'text-blue-600'
      },
      {
        label: 'Brands',
        value: this.dashboardStats.brandCount,
        icon: 'business',
        color: 'text-green-600'
      },
      {
        label: 'Low Stock Items',
        value: this.dashboardStats.lowStockProducts,
        icon: 'warning',
        color: 'text-red-600'
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

  // Template helper methods
  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  getProgressWidth(changeValue: string): number {
    const value = Math.abs(parseFloat(changeValue));
    return value > 100 ? 100 : value * 5;
  }

  // Refresh data manually
  refreshDashboard() {
    this.loadDashboardStats();
    this.loadRecentActivities();
    this.toastService.showSuccess('Dashboard data refreshed');
  }

  // Handle retry actions
  retryStats() {
    this.loadDashboardStats();
  }

  retryActivities() {
    this.loadRecentActivities();
  }

  // Make Math available to template
  Math = Math;
  parseFloat = parseFloat;
} 