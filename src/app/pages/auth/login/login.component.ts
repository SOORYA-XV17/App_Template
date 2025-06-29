import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="mt-4 text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p class="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" 
                   formControlName="username"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   placeholder="Enter your username">
            @if (loginForm.get('username')?.touched && loginForm.get('username')?.invalid) {
              <p class="mt-2 text-sm text-red-600">
                @if (loginForm.get('username')?.errors?.['required']) {
                  Username is required
                }
                @if (loginForm.get('username')?.errors?.['pattern']) {
                  Username must be 3-50 characters and contain only letters, numbers, dots, underscores, and hyphens
                }
              </p>
            }
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'"
                     formControlName="password"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Enter your password">
              <button type="button" 
                      (click)="togglePassword()"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (loginForm.get('password')?.touched && loginForm.get('password')?.invalid) {
              <p class="mt-2 text-sm text-red-600">
                @if (loginForm.get('password')?.errors?.['required']) {
                  Password is required
                }
                @if (loginForm.get('password')?.errors?.['minlength']) {
                  Password must be at least 6 characters
                }
              </p>
            }
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input type="checkbox" 
                     formControlName="rememberMe"
                     class="h-4 w-4 text-blue-600 rounded border-gray-300">
              <label class="ml-2 text-sm text-gray-600">Remember me</label>
            </div>
            <a routerLink="/forgot-password" class="text-sm text-blue-600 hover:text-blue-800">
              Forgot password?
            </a>
          </div>

          <!-- Login Button -->
          <button type="submit" 
                  [disabled]="loginForm.invalid || isLoading"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            @if (isLoading) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            } @else {
              Sign In
            }
          </button>

          <!-- Register Link -->
          <p class="text-center text-sm text-gray-600">
            Don't have an account? 
            <a routerLink="/register" class="text-blue-600 hover:text-blue-800">Create one</a>
          </p>
        </form>
      </div>
    </div>
    <app-toast />
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._-]{3,50}$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login({ username, password }).subscribe({
        next: (response) => {
          this.toastService.showSuccess('Login successful!');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.toastService.showError(error.error?.message || 'Login failed. Please try again.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}