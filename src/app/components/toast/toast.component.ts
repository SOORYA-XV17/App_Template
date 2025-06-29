import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-4">
      @for (toast of toasts; track toast) {
        <div 
          class="max-w-sm p-4 rounded-lg shadow-lg flex items-start"
          [ngClass]="{
            'bg-green-50 border-l-4 border-green-500': toast.type === 'success',
            'bg-red-50 border-l-4 border-red-500': toast.type === 'error',
            'bg-blue-50 border-l-4 border-blue-500': toast.type === 'info'
          }"
        >
          <div class="flex-1">
            <p class="text-sm" 
              [ngClass]="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-blue-800': toast.type === 'info'
              }"
            >
              {{ toast.message }}
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe((toasts: Toast[]) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}