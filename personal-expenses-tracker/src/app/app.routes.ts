import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  // TODO: Add other routes when components are created
  // { path: 'expenses', loadComponent: () => import('./components/expense-list/expense-list.component').then(c => c.ExpenseListComponent) },
  // { path: 'categories', loadComponent: () => import('./components/category-management/category-management.component').then(c => c.CategoryManagementComponent) },
  // { path: 'budget', loadComponent: () => import('./components/budget-management/budget-management.component').then(c => c.BudgetManagementComponent) },
  // { path: 'reports', loadComponent: () => import('./components/charts/charts.component').then(c => c.ChartsComponent) },
  // { path: 'settings', loadComponent: () => import('./components/settings/settings.component').then(c => c.SettingsComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
