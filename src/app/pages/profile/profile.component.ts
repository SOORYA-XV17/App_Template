import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LayoutWrapperComponent } from '../../shared/layout/layout-wrapper.component';
import { Subscription } from 'rxjs';

interface UserData {
  username: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  avatarLetter: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, LayoutWrapperComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  isLoading = true;
  isSubmitting = false;
  isLoggingOut = false;

  private userSubscription?: Subscription;

  currentUser: UserData = {
    username: '',
    email: '',
    name: '',
    role: '',
    avatar: '',
    avatarLetter: ''
  };

  // Add date properties for template
  currentDate = new Date();
  memberSinceDate = new Date('2024-01-01'); // Default date, should be set from user data
  lastLoginDate = new Date(); // Should be set from user data

  private initializeFormWithUser(user: any) {
    // Update current user data
    this.currentUser = {
      username: user.username,
      email: user.email,
      name: user.username, // Use username as name
      role: user.roles[0] || 'User',
      avatar: '',
      avatarLetter: user.avatarLetter
    };

    // Update form with user data
    this.profileForm.patchValue({
      username: user.username,
      email: user.email
    }, { emitEvent: false }); // Prevent unnecessary form events
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      username: [{ value: '', disabled: true }], // Display only
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Set loading state
    this.isLoading = true;
    console.log('Loading user profile...');

    // First load fresh data from the backend
    this.userService.loadUserProfile().subscribe({
      next: (user) => {
        console.log('Received user data:', user);
        this.initializeFormWithUser(user);
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.toastService.showError('Failed to load user profile');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });

    // Then subscribe to user updates
    this.userSubscription = this.userService.currentUser$.subscribe(user => {
      console.log('User update received:', user);
      if (user) {
        this.initializeFormWithUser(user);
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
    if (formValue.email !== this.currentUser.email) {
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
            email: this.currentUser.email
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
      email: this.currentUser.email
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
} 