import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { CodeService, Code } from '../../services/code.service';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-code-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutWrapperComponent, ToastComponent],
  template: `
    <app-layout-wrapper pageTitle="Code Management">
      <div class="p-6 space-y-6 bg-gray-50 min-h-screen">
        <!-- Page Header -->
        <div class="stat-card bg-white rounded-xl shadow-sm p-6">
          <h1 class="text-3xl font-bold text-[#0d2a66]">Location Management</h1>
          <p class="mt-2 text-gray-600">Manage countries, states, and cities with dynamic cascading dropdowns</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="bg-white rounded-xl shadow-sm p-8">
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d2a66]"></div>
            <span class="ml-4 text-gray-600 text-lg">Loading locations...</span>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="bg-white rounded-xl shadow-sm p-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <span class="material-icons text-red-500 mr-3">error</span>
              <span class="text-red-800">{{ error }}</span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div *ngIf="!loading && !error" class="space-y-6">
          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Locations</p>
                  <p class="text-2xl font-bold text-[#0d2a66]">{{ totalLocations }}</p>
                </div>
                <div class="w-12 h-12 bg-[#0d2a66]/10 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-[#0d2a66]">public</span>
                </div>
              </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Countries</p>
                  <p class="text-2xl font-bold text-[#0d2a66]">{{ countries.length }}</p>
                </div>
                <div class="w-12 h-12 bg-[#0d2a66]/10 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-[#0d2a66]">flag</span>
                </div>
              </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">States</p>
                  <p class="text-2xl font-bold text-[#0d2a66]">{{ states.length }}</p>
                </div>
                <div class="w-12 h-12 bg-[#0d2a66]/10 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-[#0d2a66]">map</span>
                </div>
              </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Cities</p>
                  <p class="text-2xl font-bold text-[#0d2a66]">{{ cities.length }}</p>
                </div>
                <div class="w-12 h-12 bg-[#0d2a66]/10 rounded-lg flex items-center justify-center">
                  <span class="material-icons text-[#0d2a66]">location_city</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Location Selection Section -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Location Selection</h2>
              <p class="text-sm text-gray-600">Choose your location from the dropdowns below</p>
            </div>
            
            <div class="p-6">
              <div class="space-y-6">
                <!-- Country Dropdown -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700">Country</label>
                  <select 
                    [(ngModel)]="selectedCountry" 
                    (change)="onCountryChange()"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] bg-white transition-all duration-200">
                    <option value="">Select Country</option>
                    <option *ngFor="let country of countries" [value]="country.keycode">
                      {{ country.valuekey }}
                    </option>
                  </select>
                </div>

                <!-- State Dropdown -->
                <div *ngIf="selectedCountry" class="space-y-2 animate-fadeIn">
                  <label class="block text-sm font-medium text-gray-700">State/Province</label>
                  <select 
                    [(ngModel)]="selectedState" 
                    (change)="onStateChange()"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] bg-white transition-all duration-200">
                    <option value="">Select State</option>
                    <option *ngFor="let state of states" [value]="state.keycode">
                      {{ state.valuekey }}
                    </option>
                  </select>
                </div>

                <!-- City Dropdown -->
                <div *ngIf="selectedState" class="space-y-2 animate-fadeIn">
                  <label class="block text-sm font-medium text-gray-700">City</label>
                  <select 
                    [(ngModel)]="selectedCity" 
                    (change)="onCityChange()"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] bg-white transition-all duration-200">
                    <option value="">Select City</option>
                    <option *ngFor="let city of cities" [value]="city.keycode">
                      {{ city.valuekey }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Selected Location Display -->
              <div *ngIf="selectedLocation" class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 animate-fadeIn">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span class="material-icons text-green-600">check_circle</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-gray-900">Selected Location</h4>
                    <p class="text-gray-600">{{ selectedLocation }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200">
                <button 
                  (click)="showCreateForm = true" 
                  class="bg-[#0d2a66] hover:bg-[#0d2a66]/90 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
                  <span class="material-icons">add</span>
                  <span>Add New Location</span>
                </button>
                <button 
                  (click)="resetSelection()" 
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200">
                  Reset Selection
                </button>
              </div>
            </div>
          </div>

          <!-- Recent Locations Table -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Recent Locations</h2>
              <p class="text-sm text-gray-600">Manage existing location entries</p>
            </div>
            
            <div class="p-6">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let code of recentCodes" class="hover:bg-[#0d2a66]/5 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [class]="getCategoryBadgeClass(code.category)">
                          {{ code.category || 'N/A' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ code.valuekey }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ code.keycode }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [class]="code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                          {{ code.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex items-center space-x-2">
                          <button 
                            (click)="editCode(code)"
                            class="p-1 text-[#0d2a66] hover:bg-[#0d2a66]/10 rounded transition-all duration-200"
                            title="Edit">
                            <span class="material-icons text-sm">edit</span>
                          </button>
                          <button 
                            (click)="deleteCode(code.id!)"
                            class="p-1 text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                            title="Delete">
                            <span class="material-icons text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Create/Edit Code Modal -->
        <div *ngIf="showCreateForm || showEditForm" class="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-xl shadow-xl w-full max-w-lg relative">
            <div class="px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ showEditForm ? 'Edit Location' : 'Add New Location' }}
              </h3>
              <p class="text-sm text-gray-600 mt-1">Configure location details</p>
            </div>
            
            <div class="p-6">
              <form [formGroup]="codeForm" (ngSubmit)="saveCode()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Keycode</label>
                  <input 
                    type="text" 
                    formControlName="keycode"
                    [readonly]="showEditForm"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200"
                    placeholder="Enter keycode">
                  <div *ngIf="codeForm.get('keycode')?.invalid && codeForm.get('keycode')?.touched" class="text-red-500 text-sm mt-1">
                    Keycode is required and must be 2-10 characters
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    formControlName="valuekey"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200"
                    placeholder="Enter location name">
                  <div *ngIf="codeForm.get('valuekey')?.invalid && codeForm.get('valuekey')?.touched" class="text-red-500 text-sm mt-1">
                    Name is required and must be 1-100 characters
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    formControlName="category"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200">
                    <option value="">Select Category</option>
                    <option value="COUNTRY">Country</option>
                    <option value="STATE">State</option>
                    <option value="CITY">City</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Parent Location</label>
                  <select 
                    formControlName="parentCode"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200">
                    <option value="">No Parent (Root)</option>
                    <option *ngFor="let parent of parentCodes" [value]="parent.id">{{ parent.valuekey }} ({{ parent.keycode }})</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input 
                    type="number" 
                    formControlName="displayOrder"
                    min="0"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200"
                    placeholder="0">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    formControlName="description"
                    rows="3"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d2a66] focus:border-[#0d2a66] transition-all duration-200"
                    placeholder="Enter description"></textarea>
                </div>
                
                <div class="flex items-center">
                  <input 
                    type="checkbox" 
                    formControlName="isActive"
                    class="h-4 w-4 text-[#0d2a66] focus:ring-[#0d2a66] border-gray-300 rounded">
                  <label class="ml-2 text-sm text-gray-700">Active</label>
                </div>
                
                <div class="flex gap-3 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    (click)="closeForm()"
                    class="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    [disabled]="codeForm.invalid || saving"
                    class="flex-1 bg-[#0d2a66] hover:bg-[#0d2a66]/90 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all duration-200">
                    {{ saving ? 'Saving...' : (showEditForm ? 'Update Location' : 'Create Location') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </app-layout-wrapper>
    
    <!-- Toast Notifications -->
    <app-toast></app-toast>
  `,
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Blue strip outside the card - similar to sidebar active state */
    .stat-card {
      position: relative;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 40px;
      background-color: #0d2a66;
      border-radius: 2px;
    }
  `]
})
export class CodeManagementComponent implements OnInit {
  codes: Code[] = [];
  countries: Code[] = [];
  states: Code[] = [];
  cities: Code[] = [];
  parentCodes: Code[] = [];
  recentCodes: Code[] = [];
  
  selectedCountry: string = '';
  selectedState: string = '';
  selectedCity: string = '';
  selectedLocation: string = '';
  
  loading = false;
  saving = false;
  error = '';
  
  showCreateForm = false;
  showEditForm = false;
  editingCode: Code | null = null;

  codeForm: FormGroup;

  constructor(
    private codeService: CodeService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.codeForm = this.fb.group({
      keycode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      valuekey: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      category: [''],
      parentCode: [''],
      displayOrder: [0, [Validators.min(0)]],
      description: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get totalLocations(): number {
    return this.codes.length;
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.codeService.getAll().subscribe({
      next: (codes) => {
        this.codes = codes;
        this.parentCodes = codes.filter(c => c.isActive);
        this.recentCodes = codes.slice(0, 10); // Show last 10 codes
        this.loadCountries();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load codes: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  loadCountries(): void {
    this.countries = this.codes.filter(c => c.category === 'COUNTRY' && c.isActive);
  }

  loadStates(): void {
    if (this.selectedCountry) {
      this.codeService.getByParentCode(this.selectedCountry).subscribe(states => {
        this.states = states.filter(s => s.category === 'STATE' && s.isActive);
        this.selectedState = '';
        this.selectedCity = '';
        this.cities = [];
        this.updateSelectedLocation();
      });
    } else {
      this.states = [];
      this.selectedState = '';
      this.selectedCity = '';
      this.cities = [];
      this.updateSelectedLocation();
    }
  }

  loadCities(): void {
    if (this.selectedState) {
      this.codeService.getByParentCode(this.selectedState).subscribe(cities => {
        this.cities = cities.filter(c => c.category === 'CITY' && c.isActive);
        this.selectedCity = '';
        this.updateSelectedLocation();
      });
    } else {
      this.cities = [];
      this.selectedCity = '';
      this.updateSelectedLocation();
    }
  }

  onCountryChange(): void {
    this.loadStates();
  }

  onStateChange(): void {
    this.loadCities();
  }

  onCityChange(): void {
    this.updateSelectedLocation();
  }

  updateSelectedLocation(): void {
    const country = this.countries.find(c => c.keycode === this.selectedCountry);
    const state = this.states.find(s => s.keycode === this.selectedState);
    const city = this.cities.find(c => c.keycode === this.selectedCity);

    if (country && state && city) {
      this.selectedLocation = `${city.valuekey}, ${state.valuekey}, ${country.valuekey}`;
    } else if (country && state) {
      this.selectedLocation = `${state.valuekey}, ${country.valuekey}`;
    } else if (country) {
      this.selectedLocation = country.valuekey;
    } else {
      this.selectedLocation = '';
    }
  }

  resetSelection(): void {
    this.selectedCountry = '';
    this.selectedState = '';
    this.selectedCity = '';
    this.selectedLocation = '';
    this.states = [];
    this.cities = [];
  }

  getCategoryBadgeClass(category: string | undefined): string {
    switch (category) {
      case 'COUNTRY':
        return 'bg-[#0d2a66]/10 text-[#0d2a66]';
      case 'STATE':
        return 'bg-green-100 text-green-800';
      case 'CITY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  editCode(code: Code): void {
    this.editingCode = code;
    this.codeForm.patchValue({
      keycode: code.keycode,
      valuekey: code.valuekey,
      category: code.category || '',
      parentCode: code.parentCode?.id || '',
      displayOrder: code.displayOrder || 0,
      description: code.description || '',
      isActive: code.isActive
    });
    this.showEditForm = true;
  }

  saveCode(): void {
    if (this.codeForm.invalid) return;

    this.saving = true;
    const formData = this.codeForm.value;
    
    // Find parent code if selected
    if (formData.parentCode) {
      const parent = this.parentCodes.find(p => p.id === formData.parentCode);
      formData.parentCode = parent;
    } else {
      formData.parentCode = undefined;
    }

    if (this.showEditForm && this.editingCode) {
      // Update existing code
      this.codeService.updateCode(this.editingCode.id!, formData).subscribe({
        next: (updatedCode) => {
          const index = this.codes.findIndex(c => c.id === updatedCode.id);
          if (index > -1) {
            this.codes[index] = updatedCode;
          }
          this.closeForm();
          this.saving = false;
          this.toastService.showSuccess('Location updated successfully');
          this.loadData(); // Reload to refresh dropdowns
        },
        error: (err) => {
          this.saving = false;
          this.toastService.showError('Failed to update location: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Create new code
      this.codeService.createOrUpdate(formData).subscribe({
        next: (newCode) => {
          this.codes.push(newCode);
          this.closeForm();
          this.saving = false;
          this.toastService.showSuccess('Location created successfully');
          this.loadData(); // Reload to refresh dropdowns
        },
        error: (err) => {
          this.saving = false;
          this.toastService.showError('Failed to create location: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  deleteCode(id: number): void {
    if (confirm('Are you sure you want to delete this location?')) {
      this.codeService.deleteById(id).subscribe({
        next: () => {
          this.codes = this.codes.filter(c => c.id !== id);
          this.recentCodes = this.codes.slice(0, 10);
          this.toastService.showSuccess('Location deleted successfully');
          this.loadData(); // Reload to refresh dropdowns
        },
        error: (err) => {
          this.toastService.showError('Failed to delete location: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  closeForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingCode = null;
    this.codeForm.reset({ isActive: true, displayOrder: 0 });
  }
} 