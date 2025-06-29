import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  ordersToday: number;
  revenue: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

export interface RecentActivity {
  id: number;
  type: 'user' | 'order' | 'product' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = '/api/jquery/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.baseUrl}/activities?limit=${limit}`);
  }

  getQuickActions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/quick-actions`);
  }
} 