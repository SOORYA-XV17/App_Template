import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutWrapperComponent],
  template: `
    <app-layout-wrapper pageTitle="Role Management">
      <div class="p-6">
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Role Management</h1>
          <p class="mt-1 text-gray-600">Manage user roles and permissions</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="text-center py-12">
            <div class="inline-block p-4 rounded-full bg-purple-100 mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Role Management</h3>
            <p class="mt-2 text-sm text-gray-500">This feature is under development</p>
          </div>
        </div>
      </div>
    </app-layout-wrapper>
  `,
  styles: []
})
export class RolesComponent {
  constructor() {}
} 