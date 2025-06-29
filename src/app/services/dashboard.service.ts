import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Backend API Response Interfaces
export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  averagePrice: number;
  totalStock: number;
  categoryCount: number;
  brandCount: number;
  lowStockProducts: number;
}

export interface UserCrudResponse {
  totalUsers?: number;
  activeUsers?: number;
  newUsersToday?: number;
  // Add other user fields as needed
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Frontend Dashboard Interfaces
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  ordersToday: number;
  revenue: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  // Additional stats
  activeProducts: number;
  featuredProducts: number;
  categoryCount: number;
  brandCount: number;
  lowStockProducts: number;
  averagePrice: number;
  totalStock: number;
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
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('DashboardService initialized with base URL:', this.baseUrl);
  }

  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    // Fetch multiple endpoints in parallel
    const productStats$ = this.getProductStatistics();
    const userStats$ = this.getUserStatistics();
    
    return forkJoin({
      productStats: productStats$,
      userStats: userStats$
    }).pipe(
      map(({ productStats, userStats }) => {
        return {
          // User stats
          totalUsers: userStats.totalUsers || 0,
          userGrowth: this.calculateGrowth(userStats.newUsersToday || 0, userStats.totalUsers || 0),
          
          // Product stats
          totalProducts: productStats.totalProducts,
          activeProducts: productStats.activeProducts,
          featuredProducts: productStats.featuredProducts,
          categoryCount: productStats.categoryCount,
          brandCount: productStats.brandCount,
          lowStockProducts: productStats.lowStockProducts,
          averagePrice: productStats.averagePrice,
          totalStock: productStats.totalStock,
          
          // Calculated/estimated values (you can replace with real data later)
          ordersToday: Math.floor(productStats.totalProducts * 0.1), // Estimate
          revenue: productStats.averagePrice * productStats.totalProducts * 0.3, // Estimate
          productGrowth: this.calculateGrowth(productStats.featuredProducts, productStats.totalProducts),
          orderGrowth: Math.floor(Math.random() * 20) - 10, // Random for demo
          revenueGrowth: Math.floor(Math.random() * 30) - 5 // Random for demo
        } as DashboardStats;
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        return of(this.getDefaultStats());
      })
    );
  }

  /**
   * Get product statistics from backend
   */
  private getProductStatistics(): Observable<ProductStatistics> {
    return this.http.get<ProductStatistics>(`${this.baseUrl}/jquery/products/statistics`).pipe(
      catchError(error => {
        console.error('Error fetching product statistics:', error);
        return of({
          totalProducts: 0,
          activeProducts: 0,
          featuredProducts: 0,
          averagePrice: 0,
          totalStock: 0,
          categoryCount: 0,
          brandCount: 0,
          lowStockProducts: 0
        });
      })
    );
  }

  /**
   * Get user statistics from backend
   */
  private getUserStatistics(): Observable<UserCrudResponse> {
    return this.http.get<any>(`${this.baseUrl}/users/crud`).pipe(
      map(response => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return {
            totalUsers: response.length,
            activeUsers: response.filter(user => user.active !== false).length,
            newUsersToday: response.filter(user => this.isToday(user.createdAt)).length
          };
        } else {
          return {
            totalUsers: response.totalUsers || response.count || 0,
            activeUsers: response.activeUsers || 0,
            newUsersToday: response.newUsersToday || 0
          };
        }
      }),
      catchError(error => {
        console.error('Error fetching user statistics:', error);
        return of({
          totalUsers: 0,
          activeUsers: 0,
          newUsersToday: 0
        });
      })
    );
  }

  /**
   * Get recent activities based on recent products and system events
   */
  getRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', limit.toString())
      .set('sortBy', 'createdAt')
      .set('sortDir', 'desc');

    return this.http.get<ProductsResponse>(`${this.baseUrl}/jquery/products`, { params }).pipe(
      map(response => {
        const activities: RecentActivity[] = [];
        
        response.content.forEach((product, index) => {
          activities.push({
            id: product.id,
            type: 'product',
            title: 'Product Added',
            description: `${product.name} was added to inventory`,
            timestamp: product.createdAt,
            icon: 'inventory',
            color: 'bg-blue-500'
          });
          
          // Add featured product activities
          if (product.featured) {
            activities.push({
              id: product.id + 1000,
              type: 'product',
              title: 'Featured Product',
              description: `${product.name} was marked as featured`,
              timestamp: product.updatedAt,
              icon: 'star',
              color: 'bg-yellow-500'
            });
          }
          
          // Add low stock warnings
          if (product.stock < 10) {
            activities.push({
              id: product.id + 2000,
              type: 'system',
              title: 'Low Stock Alert',
              description: `${product.name} is running low (${product.stock} remaining)`,
              timestamp: product.updatedAt,
              icon: 'warning',
              color: 'bg-red-500'
            });
          }
        });
        
        // Sort by timestamp and return limited results
        return activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      }),
      catchError(error => {
        console.error('Error fetching recent activities:', error);
        return of(this.getDefaultActivities());
      })
    );
  }

  /**
   * Get active products count
   */
  getActiveProductsCount(): Observable<number> {
    return this.http.get<Product[]>(`${this.baseUrl}/jquery/products/active`).pipe(
      map(products => products.length),
      catchError(() => of(0))
    );
  }

  /**
   * Get featured products count
   */
  getFeaturedProductsCount(): Observable<number> {
    return this.http.get<Product[]>(`${this.baseUrl}/jquery/products/featured`).pipe(
      map(products => products.length),
      catchError(() => of(0))
    );
  }

  /**
   * Get active menus for navigation
   */
  getActiveMenus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/menus/active`).pipe(
      catchError(error => {
        console.error('Error fetching active menus:', error);
        return of([]);
      })
    );
  }

  /**
   * Search products
   */
  searchProducts(searchTerm: string): Observable<Product[]> {
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<Product[]>(`${this.baseUrl}/jquery/products/search`, { params }).pipe(
      catchError(error => {
        console.error('Error searching products:', error);
        return of([]);
      })
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(categoryName: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/jquery/products/category/${categoryName}`).pipe(
      catchError(error => {
        console.error('Error fetching products by category:', error);
        return of([]);
      })
    );
  }

  /**
   * Get products by price range
   */
  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString());
    
    return this.http.get<Product[]>(`${this.baseUrl}/jquery/products/price-range`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching products by price range:', error);
        return of([]);
      })
    );
  }

  /**
   * Test backend connectivity
   */
  testConnection(): Observable<boolean> {
    return this.http.get(`${this.baseUrl}/test`, { observe: 'response' }).pipe(
      map(response => {
        console.log('Backend connection test successful:', response.status);
        return true;
      }),
      catchError(error => {
        console.error('Backend connection test failed:', error);
        // Try with a simple endpoint that might exist
        return this.http.get(`${this.baseUrl}/users/crud`).pipe(
          map(() => {
            console.log('Backend connection via users endpoint successful');
            return true;
          }),
          catchError(() => {
            console.error('All connection tests failed');
            return of(false);
          })
        );
      })
    );
  }

  // Helper methods
  private calculateGrowth(current: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  }

  private isToday(dateString: string): boolean {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  }

  private getDefaultStats(): DashboardStats {
    return {
      totalUsers: 0,
      totalProducts: 0,
      ordersToday: 0,
      revenue: 0,
      userGrowth: 0,
      productGrowth: 0,
      orderGrowth: 0,
      revenueGrowth: 0,
      activeProducts: 0,
      featuredProducts: 0,
      categoryCount: 0,
      brandCount: 0,
      lowStockProducts: 0,
      averagePrice: 0,
      totalStock: 0
    };
  }

  private getDefaultActivities(): RecentActivity[] {
    return [
      {
        id: 1,
        type: 'system',
        title: 'System Status',
        description: 'Unable to load recent activities',
        timestamp: new Date().toISOString(),
        icon: 'info',
        color: 'bg-gray-500'
      }
    ];
  }
} 