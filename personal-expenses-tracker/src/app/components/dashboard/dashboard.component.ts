import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { ExpenseService } from '../../services/expense.service';
import { ChartService } from '../../services/chart.service';
import { 
  DashboardData, 
  ExpenseStats, 
  CategoryStats, 
  BudgetAlert, 
  Expense,
  ExpenseCategory,
  AlertType
} from '../../models/expense.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTabsModule,
    MatGridListModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  dashboardData$: Observable<DashboardData>;
  expenses$: Observable<Expense[]>;
  categories$: Observable<ExpenseCategory[]>;
  
  // Chart configurations
  categoryPieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };
  categoryPieChartOptions: ChartConfiguration<'pie'>['options'];
  
  monthlyTrendChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  monthlyTrendChartOptions: ChartConfiguration<'line'>['options'];
  
  budgetChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  budgetChartOptions: ChartConfiguration<'bar'>['options'];
  
  // Chart types - using string literals directly
  pieChartType: 'pie' = 'pie';
  lineChartType: 'line' = 'line';
  barChartType: 'bar' = 'bar';
  
  // Component state
  isLoading = false;
  selectedTabIndex = 0;
  
  constructor(
    private expenseService: ExpenseService,
    private chartService: ChartService
  ) {
    this.dashboardData$ = this.expenseService.getDashboardData();
    this.expenses$ = this.expenseService.expenses$;
    this.categories$ = this.expenseService.categories$;
    
    // Initialize chart options
    this.categoryPieChartOptions = this.chartService.getPieChartOptions();
    this.monthlyTrendChartOptions = this.chartService.getLineChartOptions();
    this.budgetChartOptions = this.chartService.getBarChartOptions();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // Load dashboard data and update charts
    combineLatest([
      this.dashboardData$,
      this.categories$
    ])
    .pipe(
      takeUntil(this.destroy$),
      map(([dashboardData, categories]) => ({
        dashboardData,
        categories
      }))
    )
    .subscribe(({ dashboardData, categories }) => {
      this.updateCharts(dashboardData.stats, categories);
      this.isLoading = false;
    });
  }

  private updateCharts(stats: ExpenseStats, categories: ExpenseCategory[]): void {
    // Update category pie chart
    this.categoryPieChartData = this.chartService.getCategoryPieChartData(stats.categoryBreakdown);
    
    // Update monthly trend chart
    this.monthlyTrendChartData = this.chartService.getMonthlyTrendLineChartData(stats.monthlyTrend);
    
    // Update budget comparison chart
    this.budgetChartData = this.chartService.getBudgetComparisonBarChartData(stats.categoryBreakdown, categories);
  }

  // Navigation methods
  navigateToExpenses(): void {
    // This will be implemented when we add routing
    console.log('Navigate to expenses');
  }

  navigateToCategories(): void {
    console.log('Navigate to categories');
  }

  navigateToBudget(): void {
    console.log('Navigate to budget');
  }

  navigateToReports(): void {
    console.log('Navigate to reports');
  }

  // Quick actions
  addExpense(): void {
    console.log('Add expense');
  }

  addIncome(): void {
    console.log('Add income');
  }

  // Alert methods
  getAlertIcon(alertType: AlertType): string {
    switch (alertType) {
      case AlertType.DANGER:
        return 'error';
      case AlertType.WARNING:
        return 'warning';
      case AlertType.INFO:
      default:
        return 'info';
    }
  }

  getAlertColor(alertType: AlertType): string {
    switch (alertType) {
      case AlertType.DANGER:
        return 'warn';
      case AlertType.WARNING:
        return 'accent';
      case AlertType.INFO:
      default:
        return 'primary';
    }
  }

  dismissAlert(alertId: string): void {
    console.log('Dismiss alert:', alertId);
    // Implement alert dismissal logic
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return this.chartService.formatCurrency(amount);
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? (value / total) * 100 : 0;
  }

  getCategoryIcon(categoryId: string): string {
    // This would get the icon from the category service
    return 'category';
  }

  getCategoryColor(categoryId: string): string {
    // This would get the color from the category service
    return '#3f51b5';
  }

  // Chart event handlers
  onChartClick(event: any): void {
    console.log('Chart clicked:', event);
  }

  onChartHover(event: any): void {
    console.log('Chart hovered:', event);
  }

  // Tab change handler
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  // Refresh data
  refreshData(): void {
    this.loadDashboardData();
  }
}