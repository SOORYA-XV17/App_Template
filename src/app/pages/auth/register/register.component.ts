import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div class="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Create an Account</h1>
          <p class="mt-2 text-gray-600">Join us to get started</p>
        </div>

        <!-- Registration Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" 
                   formControlName="username"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="Choose a username">
            @if (registerForm.get('username')?.touched && registerForm.get('username')?.invalid) {
              <p class="mt-2 text-sm text-red-600">
                @if (registerForm.get('username')?.errors?.['required']) {
                  Username is required
                }
                @if (registerForm.get('username')?.errors?.['pattern']) {
                  Username must be 3-50 characters and contain only letters, numbers, dots, underscores, and hyphens
                }
              </p>
            }
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" 
                   formControlName="email"
                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   placeholder="Enter your email">
            @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
              <p class="mt-2 text-sm text-red-600">
                @if (registerForm.get('email')?.errors?.['required']) {
                  Email is required
                }
                @if (registerForm.get('email')?.errors?.['email']) {
                  Please enter a valid email address
                }
              </p>
            }
          </div>

          <!-- Password Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <input [type]="showPassword ? 'text' : 'password'"
                       formControlName="password"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                       placeholder="Create a password">
                <button type="button" 
                        (click)="togglePassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
                <p class="mt-2 text-sm text-red-600">
                  @if (registerForm.get('password')?.errors?.['required']) {
                    Password is required
                  }
                  @if (registerForm.get('password')?.errors?.['pattern']) {
                    Password must be at least 8 characters and contain at least one digit, one lowercase letter, one uppercase letter, and one special character
                  }
                </p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div class="relative">
                <input [type]="showPassword ? 'text' : 'password'"
                       formControlName="confirmPassword"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                       placeholder="Confirm your password">
              </div>
              @if (registerForm.get('confirmPassword')?.touched && registerForm.errors?.['passwordMismatch']) {
                <p class="mt-2 text-sm text-red-600">Passwords do not match</p>
              }
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start">
            <input type="checkbox" 
                   formControlName="acceptTerms"
                   class="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300">
            <label class="ml-2 text-sm text-gray-600">
              I agree to the 
              <a href="#" class="text-blue-600 hover:text-blue-800">Terms of Service</a> and 
              <a href="#" class="text-blue-600 hover:text-blue-800">Privacy Policy</a>
            </label>
          </div>
          @if (registerForm.get('acceptTerms')?.touched && registerForm.get('acceptTerms')?.invalid) {
            <p class="mt-2 text-sm text-red-600">You must accept the terms and conditions</p>
          }

          <!-- Register Button -->
          <button type="submit" 
                  [disabled]="registerForm.invalid || isLoading"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
            @if (isLoading) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            } @else {
              Create Account
            }
          </button>

          <!-- Login Link -->
          <p class="text-center text-sm text-gray-600">
            Already have an account? 
            <a routerLink="/login" class="text-blue-600 hover:text-blue-800">Sign in</a>
          </p>
        </form>
      </div>
    </div>
    <app-toast />
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._-]{3,50}$')
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$')
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe({
        next: () => {
          this.toastService.showSuccess('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.toastService.showError(error.error?.message || 'Registration failed. Please try again.');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}