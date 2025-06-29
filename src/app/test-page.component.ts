import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <h1 class="text-3xl font-bold mb-4">Test Page</h1>
      <p class="mb-4">This is a test page to verify routing works.</p>
      <div class="space-x-4">
        <a routerLink="/login" class="bg-blue-500 text-white px-4 py-2 rounded">Go to Login</a>
        <a routerLink="/register" class="bg-green-500 text-white px-4 py-2 rounded">Go to Register</a>
        <a routerLink="/forgot-password" class="bg-orange-500 text-white px-4 py-2 rounded">Forgot Password</a>
      </div>
    </div>
  `
})
export class TestPageComponent {} 