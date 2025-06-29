import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../../components/toast/toast.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-block p-3 rounded-full bg-blue-100 mb-4">
            <span class="material-icons text-blue-600 text-2xl">lock_reset</span>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p class="mt-2 text-gray-600">
            @if (!otpSent) {
              Enter your email to receive reset instructions
            } @else {
              Enter the OTP sent to your email and your new password
            }
          </p>
        </div>

        @if (!otpSent) {
          <!-- Email Form -->
          <form [formGroup]="emailForm" (ngSubmit)="onSendOtp()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" 
                     formControlName="email"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     placeholder="Enter your email">
              @if (emailForm.get('email')?.touched && emailForm.get('email')?.invalid) {
                <p class="mt-2 text-sm text-red-600">
                  @if (emailForm.get('email')?.errors?.['required']) {
                    Email is required
                  }
                  @if (emailForm.get('email')?.errors?.['email']) {
                    Please enter a valid email address
                  }
                </p>
              }
            </div>

            <button type="submit" 
                    [disabled]="emailForm.invalid || isLoading"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isLoading) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              } @else {
                Send Reset Link
              }
            </button>
          </form>
        } @else {
          <!-- OTP and New Password Form -->
          <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()" class="space-y-6">
            <!-- OTP -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">OTP Code</label>
              <input type="text" 
                     formControlName="otpCode"
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     placeholder="Enter 6-digit OTP">
              @if (resetForm.get('otpCode')?.touched && resetForm.get('otpCode')?.invalid) {
                <p class="mt-2 text-sm text-red-600">
                  @if (resetForm.get('otpCode')?.errors?.['required']) {
                    OTP is required
                  }
                  @if (resetForm.get('otpCode')?.errors?.['pattern']) {
                    OTP must be exactly 6 digits
                  }
                </p>
              }
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div class="relative">
                <input [type]="showPassword ? 'text' : 'password'"
                       formControlName="newPassword"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                       placeholder="Enter new password">
                <button type="button" 
                        (click)="togglePassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (resetForm.get('newPassword')?.touched && resetForm.get('newPassword')?.invalid) {
                <p class="mt-2 text-sm text-red-600">
                  @if (resetForm.get('newPassword')?.errors?.['required']) {
                    New password is required
                  }
                  @if (resetForm.get('newPassword')?.errors?.['pattern']) {
                    Password must be at least 8 characters and contain at least one digit, one lowercase letter, one uppercase letter, and one special character
                  }
                </p>
              }
            </div>

            <button type="submit" 
                    [disabled]="resetForm.invalid || isLoading"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isLoading) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting password...
                </span>
              } @else {
                Reset Password
              }
            </button>
          </form>
        }

        <p class="text-center text-sm text-gray-600 mt-6">
          Remember your password? 
          <a routerLink="/login" class="text-blue-600 hover:text-blue-800">Back to login</a>
        </p>
      </div>
    </div>
    <app-toast />
  `
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  resetForm: FormGroup;
  isLoading = false;
  otpSent = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      otpCode: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{6}$')
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$')
      ]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSendOtp() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const email = this.emailForm.get('email')?.value;

      this.authService.sendForgotPasswordOtp(email).subscribe({
        next: () => {
          this.otpSent = true;
          this.toastService.showSuccess('OTP sent to your email!');
        },
        error: (error) => {
          this.toastService.showError(error.error?.message || 'Failed to send OTP. Please try again.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  onResetPassword() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      const data = {
        email: this.emailForm.get('email')?.value,
        otpCode: this.resetForm.get('otpCode')?.value,
        newPassword: this.resetForm.get('newPassword')?.value
      };

      this.authService.verifyForgotPasswordOtp(data).subscribe({
        next: () => {
          this.toastService.showSuccess('Password reset successful! Please login with your new password.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.toastService.showError(error.error?.message || 'Failed to reset password. Please try again.');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}