import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { MenuManagementComponent } from './pages/menu-management/menu-management.component';
import { UsersComponent } from './pages/users/users.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { Subdashsds35b5oa4rdComponent } from './pages/subdashsds35b5oa4rd/subdashsds35b5oa4rd.component';
import { CodeManagementComponent } from './pages/code-management/code-management.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'test', loadComponent: () => import('./test-page.component').then(m => m.TestPageComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'roles', 
    component: RolesComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'menus', 
    component: MenuManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'code_mangement', 
    component: CodeManagementComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'reports', 
    component: ReportsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'subdashsds35b5oa4rd', 
    component: Subdashsds35b5oa4rdComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'hybrid-encryption-test', 
    loadComponent: () => import('./components/hybrid-encryption-test/hybrid-encryption-test.component').then(m => m.HybridEncryptionTestComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
