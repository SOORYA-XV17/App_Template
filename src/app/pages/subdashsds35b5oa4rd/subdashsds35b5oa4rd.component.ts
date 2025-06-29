import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';

@Component({
  selector: 'app-subdashsds35b5oa4rd',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutWrapperComponent],
  template: `
    <app-layout-wrapper pageTitle="Sub Dashboard">
      <div class="p-6">
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 class="text-2xl font-bold text-gray-900">Sub Dashboard</h1>
          <p class="mt-1 text-gray-600">Sub dashboard view under User Management</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="text-center py-12">
            <div class="inline-block p-4 rounded-full bg-orange-100 mb-4">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Sub Dashboard</h3>
            <p class="mt-2 text-sm text-gray-500">This is a submenu item under User Management</p>
          </div>
        </div>
      </div>
    </app-layout-wrapper>
  `,
  styles: []
})
export class Subdashsds35b5oa4rdComponent {
  constructor() {}
} 