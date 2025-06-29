import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  brand: string;
  sku: string;
  stockQuantity: number;
  active: boolean;
  featured: boolean;
  launchDate?: string;
  weightKg?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = '/api/jquery/products';

  constructor(private http: HttpClient) {}

  getAllProducts(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
    return this.http.get<any>(`${this.baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
  }

  getProductStatistics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/statistics`);
  }

  searchProducts(q: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search?q=${encodeURIComponent(q)}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/brands`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/category/${encodeURIComponent(category)}`);
  }

  getProductsByBrand(brand: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/brand/${encodeURIComponent(brand)}`);
  }

  filterProducts(filter: any = {}, page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
    return this.http.post<any>(`${this.baseUrl}/filter?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`, filter);
  }

  createProduct(product: Product) {
    return this.http.post<Product>(`${this.baseUrl}`, product);
  }

  updateProduct(id: number, product: Product) {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  exportProducts(params: any) {
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
} 