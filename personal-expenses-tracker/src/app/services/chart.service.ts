import { Injectable } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { 
  CategoryStats, 
  MonthlyStats, 
  ExpenseStats,
  ChartData, 
  ChartOptions,
  ExpenseCategory,
  Expense
} from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  // Generate pie chart data for category breakdown
  getCategoryPieChartData(categoryStats: CategoryStats[]): ChartConfiguration<'pie'>['data'] {
    const validStats = categoryStats.filter(stat => stat.totalAmount > 0);
    
    return {
      labels: validStats.map(stat => stat.categoryName),
      datasets: [{
        data: validStats.map(stat => stat.totalAmount),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
          '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#747D8C'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  // Generate pie chart options
  getPieChartOptions(): ChartConfiguration<'pie'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = ((value / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  // Generate line chart data for monthly trend
  getMonthlyTrendLineChartData(monthlyStats: MonthlyStats[]): ChartConfiguration<'line'>['data'] {
    const sortedStats = monthlyStats.sort((a, b) => {
      const dateA = new Date(a.year, new Date(`${a.month} 1, ${a.year}`).getMonth());
      const dateB = new Date(b.year, new Date(`${b.month} 1, ${b.year}`).getMonth());
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sortedStats.map(stat => `${stat.month} ${stat.year}`),
      datasets: [
        {
          label: 'Expenses',
          data: sortedStats.map(stat => stat.totalExpenses),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Income',
          data: sortedStats.map(stat => stat.totalIncome),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Net Amount',
          data: sortedStats.map(stat => stat.netAmount),
          borderColor: '#45B7D1',
          backgroundColor: 'rgba(69, 183, 209, 0.1)',
          tension: 0.4,
          fill: false
        }
      ]
    };
  }

  // Generate line chart options
  getLineChartOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: $${value.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Month'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Amount ($)'
          },
          beginAtZero: true
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  }

  // Generate bar chart data for budget comparison
  getBudgetComparisonBarChartData(
    categoryStats: CategoryStats[],
    categories: ExpenseCategory[]
  ): ChartConfiguration<'bar'>['data'] {
    const categoriesWithBudget = categoryStats.filter(stat => stat.budgetAmount && stat.budgetAmount > 0);
    
    return {
      labels: categoriesWithBudget.map(stat => stat.categoryName),
      datasets: [
        {
          label: 'Spent',
          data: categoriesWithBudget.map(stat => stat.totalAmount),
          backgroundColor: '#FF6B6B',
          borderColor: '#FF6B6B',
          borderWidth: 1
        },
        {
          label: 'Budget',
          data: categoriesWithBudget.map(stat => stat.budgetAmount || 0),
          backgroundColor: '#4ECDC4',
          borderColor: '#4ECDC4',
          borderWidth: 1
        }
      ]
    };
  }

  // Generate bar chart options
  getBarChartOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: $${value.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Category'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Amount ($)'
          },
          beginAtZero: true
        }
      }
    };
  }

  // Generate doughnut chart data for expense vs income
  getExpenseIncomeDonutChartData(stats: ExpenseStats): ChartConfiguration<'doughnut'>['data'] {
    return {
      labels: ['Expenses', 'Income'],
      datasets: [{
        data: [stats.totalExpenses, stats.totalIncome],
        backgroundColor: ['#FF6B6B', '#4ECDC4'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  // Generate doughnut chart options
  getDoughnutChartOptions(): ChartConfiguration<'doughnut'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%'
    };
  }

  // Generate weekly spending chart data
  getWeeklySpendingChartData(expenses: Expense[]): ChartConfiguration<'bar'>['data'] {
    const weeklyData = new Map<string, number>();
    const today = new Date();
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toLocaleDateString('en-US', { weekday: 'short' });
      weeklyData.set(dayKey, 0);
    }

    // Aggregate expenses by day
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const daysDiff = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff <= 6 && expense.amount < 0) {
        const dayKey = expenseDate.toLocaleDateString('en-US', { weekday: 'short' });
        const currentAmount = weeklyData.get(dayKey) || 0;
        weeklyData.set(dayKey, currentAmount + Math.abs(expense.amount));
      }
    });

    return {
      labels: Array.from(weeklyData.keys()),
      datasets: [{
        label: 'Daily Spending',
        data: Array.from(weeklyData.values()),
        backgroundColor: '#45B7D1',
        borderColor: '#45B7D1',
        borderWidth: 1
      }]
    };
  }

  // Generate payment method chart data
  getPaymentMethodChartData(expenses: Expense[]): ChartConfiguration<'pie'>['data'] {
    const paymentMethodData = new Map<string, number>();
    
    expenses.forEach(expense => {
      if (expense.amount < 0) { // Only expenses, not income
        const method = expense.paymentMethod.replace('_', ' ').toUpperCase();
        const currentAmount = paymentMethodData.get(method) || 0;
        paymentMethodData.set(method, currentAmount + Math.abs(expense.amount));
      }
    });

    return {
      labels: Array.from(paymentMethodData.keys()),
      datasets: [{
        data: Array.from(paymentMethodData.values()),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
          '#FF9FF3', '#54A0FF'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }

  // Generate year-over-year comparison chart
  getYearOverYearChartData(expenses: Expense[]): ChartConfiguration<'line'>['data'] {
    const yearlyData = new Map<string, Map<string, number>>();
    
    expenses.forEach(expense => {
      const year = expense.date.getFullYear().toString();
      const month = expense.date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!yearlyData.has(year)) {
        yearlyData.set(year, new Map());
      }
      
      const yearData = yearlyData.get(year)!;
      const currentAmount = yearData.get(month) || 0;
      
      if (expense.amount < 0) {
        yearData.set(month, currentAmount + Math.abs(expense.amount));
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const datasets = Array.from(yearlyData.entries()).map(([year, monthData], index) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
      
      return {
        label: year,
        data: months.map(month => monthData.get(month) || 0),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        tension: 0.4,
        fill: false
      };
    });

    return {
      labels: months,
      datasets
    };
  }

  // Utility method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Utility method to generate random colors
  generateColors(count: number): string[] {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#747D8C',
      '#FF9F43', '#10AC84', '#EE5A24', '#0FB9B1', '#A55EEA'
    ];
    
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }

  // Utility method to generate gradient colors
  generateGradientColors(count: number): string[] {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(gradients[i % gradients.length]);
    }
    
    return result;
  }
}