import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { ProductService, Product } from '../../services/product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutWrapperComponent, FormsModule],
  template: `
    <app-layout-wrapper pageTitle="Reports">
      <div class="p-6">
        <!-- Header Card -->
        <div class="header-card bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Industrial Reports Dashboard</h1>
          <p class="mt-1 text-gray-600">View system reports and analytics for industrial operations</p>
        </div>

        <!-- Statistics Cards -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4 text-[#0d2a66]">Product Statistics</h2>
          
          <!-- Loading State -->
          <div *ngIf="isLoadingStats" class="text-gray-400 flex items-center justify-center py-8">
            <span class="material-icons animate-spin mr-2">refresh</span>
            Loading statistics...
          </div>
          
          <!-- Error State -->
          <div *ngIf="statsError && !isLoadingStats" class="text-center py-8">
            <span class="material-icons text-red-500 text-4xl mb-2">error_outline</span>
            <div class="text-red-600 font-medium">Failed to load statistics</div>
            <button (click)="loadStats()" class="btn-primary mt-3 text-sm">
              <span class="material-icons mr-1 text-sm">refresh</span>
              Retry
            </button>
          </div>
          
          <!-- Statistics Data -->
          <div *ngIf="stats && !isLoadingStats && !statsError" class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-[#0d2a66] to-[#0d2a66]/80 rounded-lg p-4 text-center text-white">
              <div class="text-2xl font-bold">{{ stats.totalProducts || 0 }}</div>
              <div class="text-white/80">Total Products</div>
            </div>
            <div class="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4 text-center text-white">
              <div class="text-2xl font-bold">{{ stats.activeProducts || 0 }}</div>
              <div class="text-green-100">Active</div>
            </div>
            <div class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4 text-center text-white">
              <div class="text-2xl font-bold">{{ stats.featuredProducts || 0 }}</div>
              <div class="text-purple-100">Featured</div>
            </div>
            <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg p-4 text-center text-white">
              <div class="text-2xl font-bold">{{ (stats.averagePrice || 0) | number:'1.2-2' }}</div>
              <div class="text-amber-100">Avg Price</div>
            </div>
          </div>
        </div>

        <!-- Product Management Card -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-xl font-semibold mb-4 flex items-center justify-between text-[#0d2a66]">
            <span class="flex items-center">
              <span class="material-icons mr-2">inventory_2</span>
              Product Management
            </span>
            <div class="flex gap-3">
              <button (click)="openExportModal()" 
                      class="btn-secondary flex items-center">
                <span class="material-icons mr-2 text-sm">download</span>
                Export to Excel
              </button>
              <button (click)="openAddProduct()" 
                      class="btn-primary flex items-center">
                <span class="material-icons mr-2 text-sm">add</span>
                Add Product
              </button>
            </div>
          </h2>

          <!-- Filters and Search -->
          <form class="bg-gray-50 rounded-lg p-4 mb-6" (ngSubmit)="onSearch()">
            <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                <input [(ngModel)]="search" name="search" 
                       placeholder="Search by name, SKU..." 
                       class="input-field w-full" 
                       (keyup.enter)="onSearch()" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select [(ngModel)]="category" name="category" 
                        (change)="onFilterChange()" 
                        class="input-field w-full">
                  <option value="">All Categories</option>
                  <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select [(ngModel)]="brand" name="brand" 
                        (change)="onFilterChange()" 
                        class="input-field w-full">
                  <option value="">All Brands</option>
                  <option *ngFor="let b of brands" [value]="b">{{ b }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select [(ngModel)]="sortBy" name="sortBy" 
                        (change)="onSortChange(sortBy)" 
                        class="input-field w-full">
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stockQuantity">Stock</option>
                  <option value="brand">Brand</option>
                  <option value="category">Category</option>
                </select>
              </div>
              <div class="flex gap-2">
                <button type="button" (click)="toggleSortDir()" 
                        class="btn-outline flex items-center">
                  <span class="material-icons mr-1 text-sm">{{ sortDir === 'asc' ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}</span>
                  {{ sortDir === 'asc' ? 'Asc' : 'Desc' }}
                </button>
                <button type="submit" class="btn-primary flex items-center">
                  <span class="material-icons mr-1 text-sm">search</span>
                  Search
                </button>
              </div>
            </div>
          </form>

          <!-- Products Table -->
          <!-- Loading State -->
          <div *ngIf="isLoadingProducts" class="text-gray-400 flex items-center justify-center py-12">
            <span class="material-icons animate-spin mr-2">refresh</span>
            Loading products...
          </div>
          
          <!-- Error State -->
          <div *ngIf="productsError && !isLoadingProducts" class="text-center py-12">
            <span class="material-icons text-red-500 text-6xl mb-4">error_outline</span>
            <div class="text-red-600 font-medium text-lg mb-2">Failed to load products</div>
            <p class="text-gray-600 mb-4">Unable to fetch product data from the server.</p>
            <button (click)="loadProducts()" class="btn-primary">
              <span class="material-icons mr-2">refresh</span>
              Retry Loading
            </button>
          </div>
          
          <!-- No Products State -->
          <div *ngIf="!isLoadingProducts && !productsError && products.length === 0" class="text-center py-12">
            <span class="material-icons text-gray-400 text-6xl mb-4">inventory_2</span>
            <div class="text-gray-600 font-medium text-lg mb-2">No products found</div>
            <p class="text-gray-500 mb-4">
              <span *ngIf="search || category || brand">Try adjusting your filters or search terms.</span>
              <span *ngIf="!search && !category && !brand">Start by adding your first product.</span>
            </p>
            <div class="flex gap-3 justify-center">
              <button *ngIf="search || category || brand" (click)="clearFilters()" class="btn-outline">
                <span class="material-icons mr-2">clear</span>
                Clear Filters
              </button>
              <button (click)="openAddProduct()" class="btn-primary">
                <span class="material-icons mr-2">add</span>
                Add Product
              </button>
            </div>
          </div>
          
          <!-- Products Data -->
          <div *ngIf="!isLoadingProducts && !productsError && products.length > 0">
            <div class="overflow-x-auto border rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let p of products; trackBy: trackByProductId" class="hover:bg-[#0d2a66]/5 transition-colors duration-150">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-medium text-gray-900">{{ p.name || 'Unnamed Product' }}</div>
                      <div class="text-sm text-gray-500">{{ p.sku || 'No SKU' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ p.category || 'Uncategorized' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ p.brand || 'No Brand' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">{{ p.price | currency }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <span [class]="p.stockQuantity > 10 ? 'text-green-600' : p.stockQuantity > 0 ? 'text-yellow-600' : 'text-red-600'">
                        {{ p.stockQuantity || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                      <div class="flex items-center justify-center space-x-2">
                        <button (click)="openEditProduct(p)" 
                                class="btn-sm-primary flex items-center"
                                title="Edit Product">
                          <span class="material-icons text-sm">edit</span>
                        </button>
                        <button (click)="deleteProduct(p)" 
                                class="btn-sm-danger flex items-center"
                                title="Delete Product">
                          <span class="material-icons text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="mt-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50 px-4 py-3 rounded-lg">
              <div class="flex items-center gap-2">
                <label for="pageSize" class="text-sm font-medium text-gray-700">Rows per page:</label>
                <select id="pageSize" [(ngModel)]="size" 
                        (change)="onPageSizeChange(size)" 
                        class="input-field-sm">
                  <option *ngFor="let s of pageSizes" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <button (click)="prevPage()" 
                        [disabled]="page === 0" 
                        class="btn-pagination"
                        [class.disabled]="page === 0">
                  <span class="material-icons text-sm">chevron_left</span>
                  Previous
                </button>
                <span class="text-sm text-gray-700 font-medium">
                  Page {{ page + 1 }} of {{ totalPages }} ({{ totalItems }} items)
                </span>
                <button (click)="nextPage()" 
                        [disabled]="!hasMore" 
                        class="btn-pagination"
                        [class.disabled]="!hasMore">
                  Next
                  <span class="material-icons text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Modal -->
        <div *ngIf="showProductForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 class="text-xl font-bold text-[#0d2a66] flex items-center">
                <span class="material-icons mr-2">{{ editingProduct ? 'edit' : 'add' }}</span>
                {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
              </h3>
              <button (click)="closeProductForm()" 
                      class="text-gray-400 hover:text-gray-600 p-1 rounded">
                <span class="material-icons">close</span>
              </button>
            </div>
            <form (ngSubmit)="saveProduct()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input [(ngModel)]="productForm.name" name="name" required 
                         class="input-field w-full" 
                         placeholder="Enter product name" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea [(ngModel)]="productForm.description" name="description" 
                            class="input-field w-full h-20" 
                            placeholder="Enter product description"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input [(ngModel)]="productForm.category" name="category" required 
                         class="input-field w-full" 
                         placeholder="Enter category" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input [(ngModel)]="productForm.brand" name="brand" required 
                         class="input-field w-full" 
                         placeholder="Enter brand" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" step="0.01" [(ngModel)]="productForm.price" name="price" required 
                         class="input-field w-full" 
                         placeholder="0.00" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input type="number" [(ngModel)]="productForm.stockQuantity" name="stockQuantity" required 
                         class="input-field w-full" 
                         placeholder="0" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input [(ngModel)]="productForm.sku" name="sku" 
                         class="input-field w-full" 
                         placeholder="Enter SKU" />
                </div>
                <div class="flex items-center space-x-6 pt-6">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" [(ngModel)]="productForm.active" name="active" 
                           class="w-4 h-4 text-[#0d2a66] border-gray-300 rounded focus:ring-[#0d2a66]" />
                    <span class="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" [(ngModel)]="productForm.featured" name="featured" 
                           class="w-4 h-4 text-[#0d2a66] border-gray-300 rounded focus:ring-[#0d2a66]" />
                    <span class="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
              <div class="flex gap-3 justify-end pt-6 border-t">
                <button type="button" (click)="closeProductForm()" class="btn-outline">
                  Cancel
                </button>
                <button type="submit" class="btn-primary">
                  <span class="material-icons mr-2 text-sm">{{ editingProduct ? 'save' : 'add' }}</span>
                  {{ editingProduct ? 'Update Product' : 'Add Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Export Modal -->
        <div *ngIf="showExportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <div class="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 class="text-xl font-bold text-[#0d2a66] flex items-center">
                <span class="material-icons mr-2">download</span>
                Export to Excel
              </h3>
              <button (click)="closeExportModal()" 
                      class="text-gray-400 hover:text-gray-600 p-1 rounded">
                <span class="material-icons">close</span>
              </button>
            </div>
            <form (ngSubmit)="submitExport()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select [(ngModel)]="exportForm.sortBy" name="exportSortBy" class="input-field w-full">
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stockQuantity">Stock</option>
                    <option value="brand">Brand</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
                  <select [(ngModel)]="exportForm.sortDir" name="exportSortDir" class="input-field w-full">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Search Filter</label>
                <input [(ngModel)]="exportForm.search" name="exportSearch" 
                       class="input-field w-full" 
                       placeholder="Filter products for export" />
              </div>
              <div class="flex gap-3 justify-end pt-4 border-t">
                <button type="button" (click)="closeExportModal()" class="btn-outline">
                  Cancel
                </button>
                <button type="submit" class="btn-secondary">
                  <span class="material-icons mr-2 text-sm">download</span>
                  Export Excel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-layout-wrapper>
  `,
  styles: [`
    /* Header Card with Blue Strip */
    .header-card {
      position: relative;
    }

    .header-card::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      height: 60px;
      width: 4px;
      background-color: #0d2a66;
      border-radius: 2px;
    }

    /* Professional Industrial Button Styles */
    .btn-primary {
      background-color: #0d2a66 !important;
      color: white !important;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      border: none;
      cursor: pointer;
    }

    .btn-primary:hover {
      background-color: #0a2354 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-primary:focus {
      outline: none;
      box-shadow: 0 0 0 2px #0d2a66, 0 0 0 4px rgba(13, 42, 102, 0.2);
    }

    .btn-secondary {
      @apply bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2;
    }

    .btn-outline {
      @apply border-2 border-[#0d2a66] text-[#0d2a66] hover:bg-[#0d2a66] hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0d2a66] focus:ring-offset-2;
    }

    .btn-sm-primary {
      @apply bg-[#0d2a66] hover:bg-[#0d2a66]/90 text-white px-2 py-1 rounded transition-all duration-200 text-sm;
    }

    .btn-sm-danger {
      @apply bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-all duration-200 text-sm;
    }

    .btn-pagination {
      @apply bg-white border border-gray-300 text-gray-700 hover:bg-[#0d2a66] hover:text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed;
    }

    .btn-pagination.disabled {
      @apply opacity-50 cursor-not-allowed hover:bg-white hover:text-gray-700;
    }

    /* Professional Form Inputs */
    .input-field {
      @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0d2a66] focus:border-transparent transition-all duration-200;
    }

    .input-field-sm {
      @apply border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0d2a66] focus:border-transparent transition-all duration-200 text-sm;
    }

    /* Professional Table Styles */
    .table-professional {
      @apply min-w-full divide-y divide-gray-200 shadow-sm border border-gray-200 rounded-lg overflow-hidden;
    }

    .table-professional thead {
      @apply bg-gradient-to-r from-[#0d2a66] to-[#0d2a66]/90;
    }

    .table-professional th {
      @apply px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider;
    }

    .table-professional td {
      @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
    }

    .table-professional tbody tr {
      @apply hover:bg-[#0d2a66]/5 transition-colors duration-150;
    }

    /* Loading Animation */
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class ReportsComponent implements OnInit {
  stats: any = null;
  products: Product[] = [];
  page = 0;
  size = 10;
  hasMore = false;
  search = '';
  category = '';
  brand = '';
  sortBy = 'name';
  sortDir = 'asc';
  categories: string[] = [];
  brands: string[] = [];
  
  // Loading states
  isLoadingStats = true;
  isLoadingProducts = true;
  isLoadingCategories = true;
  
  // Error states
  statsError = false;
  productsError = false;
  categoriesError = false;
  
  showProductForm = false;
  editingProduct: Product | null = null;
  productForm: Product = {
    id: 0,
    name: '',
    description: '',
    price: 0,
    category: '',
    brand: '',
    sku: '',
    stockQuantity: 0,
    active: true,
    featured: false
  };
  totalPages = 1;
  totalItems = 0;
  pageSizes = [5, 10, 20, 50];
  showExportModal = false;
  exportForm = {
    sortBy: 'name',
    sortDir: 'asc',
    search: '',
    category: '',
    brand: ''
  };

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadStats();
    this.loadProducts();
    this.loadCategoriesAndBrands();
  }

  loadStats() {
    this.isLoadingStats = true;
    this.statsError = false;
    this.productService.getProductStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.statsError = true;
        this.isLoadingStats = false;
        this.stats = null;
      }
    });
  }

  loadCategoriesAndBrands() {
    this.isLoadingCategories = true;
    this.categoriesError = false;
    
    // Load categories
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories || [];
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories = [];
        this.categoriesError = true;
      }
    });

    // Load brands
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands || [];
        this.isLoadingCategories = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.brands = [];
        this.isLoadingCategories = false;
        this.categoriesError = true;
      }
    });
  }

  loadProducts() {
    this.isLoadingProducts = true;
    this.productsError = false;
    
    const filter: any = {};
    if (this.search) filter.globalSearch = this.search;
    if (this.category) filter.category = this.category;
    if (this.brand) filter.brand = this.brand;
    
    this.productService.filterProducts(filter, this.page, this.size, this.sortBy, this.sortDir).subscribe({
      next: (res) => {
        this.products = res.content || [];
        this.totalPages = res.totalPages || 1;
        this.totalItems = res.totalElements || 0;
        this.hasMore = res.totalPages ? this.page < res.totalPages - 1 : false;
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.productsError = true;
        this.isLoadingProducts = false;
        this.totalPages = 1;
        this.totalItems = 0;
        this.hasMore = false;
      }
    });
  }

  onSearch() {
    this.page = 0;
    this.loadProducts();
  }

  onFilterChange() {
    this.page = 0;
    this.loadProducts();
  }

  onSortChange(sortBy: string) {
    this.sortBy = sortBy;
    this.page = 0;
    this.loadProducts();
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.page = 0;
    this.loadProducts();
  }

  nextPage() {
    if (this.hasMore) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  openAddProduct() {
    this.editingProduct = null;
    this.productForm = {
      id: 0,
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      sku: '',
      stockQuantity: 0,
      active: true,
      featured: false
    };
    this.showProductForm = true;
  }

  openEditProduct(product: Product) {
    this.editingProduct = product;
    this.productForm = { ...product };
    this.showProductForm = true;
  }

  closeProductForm() {
    this.showProductForm = false;
    this.editingProduct = null;
  }

  saveProduct() {
    if (this.editingProduct) {
      this.productService.updateProduct(this.editingProduct.id, this.productForm).subscribe({
        next: () => {
          this.closeProductForm();
          this.loadProducts();
          this.loadStats(); // Refresh stats after update
        },
        error: (error) => {
          console.error('Error updating product:', error);
          alert('Failed to update product. Please try again.');
        }
      });
    } else {
      this.productService.createProduct(this.productForm).subscribe({
        next: () => {
          this.closeProductForm();
          this.loadProducts();
          this.loadStats(); // Refresh stats after creation
        },
        error: (error) => {
          console.error('Error creating product:', error);
          alert('Failed to create product. Please try again.');
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.loadStats(); // Refresh stats after deletion
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  onPageSizeChange(newSize: number) {
    this.size = +newSize;
    this.page = 0;
    this.loadProducts();
  }

  clearFilters() {
    this.search = '';
    this.category = '';
    this.brand = '';
    this.page = 0;
    this.loadProducts();
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  openExportModal() {
    this.exportForm = {
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      search: this.search,
      category: this.category,
      brand: this.brand
    };
    this.showExportModal = true;
  }

  closeExportModal() {
    this.showExportModal = false;
  }

  submitExport() {
    const params: any = {
      sortBy: this.exportForm.sortBy,
      sortDir: this.exportForm.sortDir
    };
    if (this.exportForm.search) params.globalSearch = this.exportForm.search;
    if (this.exportForm.category) params.category = this.exportForm.category;
    if (this.exportForm.brand) params.brand = this.exportForm.brand;
    
    this.productService.exportProducts(params).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.closeExportModal();
      },
      error: (error) => {
        console.error('Error exporting products:', error);
        alert('Failed to export products. Please try again.');
      }
    });
  }
} 