import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout 
      [pageTitle]="pageTitle"
      [notifications]="notifications"
      (notificationDismiss)="onNotificationDismiss($event)">
      <ng-content></ng-content>
    </app-layout>
  `,
  styles: []
})
export class LayoutWrapperComponent {
  @Input() pageTitle: string = 'Dashboard';
  @Input() notifications: any[] = [];

  onNotificationDismiss(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }
} 