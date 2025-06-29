import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService, UserProfile } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LayoutWrapperComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: UserProfile | null = null;
  profileForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  isLoggingOut = false;
  isSaving = false;
  isEditing = false;
  hasSuperAdminAccess = false;

  private userSubscription?: Subscription;

  // Add date properties for template
  currentDate = new Date();
  memberSinceDate = new Date('2024-01-01'); // Default date, should be set from user data
  lastLoginDate = new Date(); // Should be set from user data

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.profileForm.disable();
    this.hasSuperAdminAccess = this.authService.getUserRoles().includes('SUPERADMIN');
    
    this.userService.loadUserProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.profileForm.patchValue(user);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError('Failed to load profile data');
        console.error('Profile: Error loading user profile', err);
        this.isLoading = false;
      }
    });

    // Then subscribe to user updates
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      console.log('User update received:', user);
      if (user) {
        this.currentUser = user;
        this.profileForm.patchValue(user);
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.profileForm.value;
    
    // Only proceed if email has changed
    if (formValue.email !== this.currentUser?.email) {
      this.isSubmitting = true;
      
      this.userService.updateProfile({ email: formValue.email }).subscribe({
        next: (user) => {
          this.toastService.showSuccess('Email updated successfully');
          // Reload user data to ensure we have the latest
          this.userService.loadUserProfile().subscribe();
        },
        error: (error) => {
          console.error('Email update error:', error);
          this.toastService.showError(error.error?.message || 'Failed to update email');
          // Reset form to previous value on error
          this.profileForm.patchValue({
            email: this.currentUser?.email
          });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel() {
    this.profileForm.patchValue({
      email: this.currentUser?.email
    });
    this.profileForm.markAsUntouched();
  }

  logout() {
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.toastService.showError('Failed to logout');
        this.isLoggingOut = false;
      }
    });
  }

  get emailError() {
    const control = this.profileForm.get('email');
    if (control?.errors?.['required'] && control.touched) {
      return 'Email is required';
    }
    if (control?.errors?.['email'] && control.touched) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  editProfile() {
    this.isEditing = true;
    this.profileForm.enable();
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.toastService.showSuccess('Profile updated successfully!');
        this.isEditing = false;
        this.profileForm.disable();
        this.isSaving = false;
        // No need to refresh user data globally here, the service's BehaviorSubject handles it.
      },
      error: (err) => {
        this.toastService.showError('Failed to update profile');
        this.isSaving = false;
      }
    });
  }
} 