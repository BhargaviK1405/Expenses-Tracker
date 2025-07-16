import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { 
  Expense, 
  ExpenseCategory, 
  Budget, 
  RecurringExpense, 
  ExpenseFilter, 
  ExpenseStats, 
  CategoryStats, 
  MonthlyStats, 
  DashboardData, 
  BudgetAlert, 
  DEFAULT_CATEGORIES,
  CreateExpenseDto,
  UpdateExpenseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBudgetDto,
  UpdateBudgetDto,
  AlertType,
  TransactionType
} from '../models/expense.model';
import { LocalStorageService } from './local-storage.service';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, addMonths } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private readonly EXPENSES_KEY = 'expenses';
  private readonly CATEGORIES_KEY = 'categories';
  private readonly BUDGETS_KEY = 'budgets';
  private readonly RECURRING_KEY = 'recurring_expenses';

  // BehaviorSubjects for reactive programming
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private categoriesSubject = new BehaviorSubject<ExpenseCategory[]>([]);
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  private recurringSubject = new BehaviorSubject<RecurringExpense[]>([]);
  private filterSubject = new BehaviorSubject<ExpenseFilter>({});

  // Public observables
  public expenses$ = this.expensesSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public budgets$ = this.budgetsSubject.asObservable();
  public recurring$ = this.recurringSubject.asObservable();
  public filter$ = this.filterSubject.asObservable();

  constructor(private localStorage: LocalStorageService) {
    this.initializeData();
  }

  // Initialize data from localStorage
  private initializeData(): void {
    const expenses = this.localStorage.getItem<Expense[]>(this.EXPENSES_KEY) || [];
    const categories = this.localStorage.getItem<ExpenseCategory[]>(this.CATEGORIES_KEY) || [];
    const budgets = this.localStorage.getItem<Budget[]>(this.BUDGETS_KEY) || [];
    const recurring = this.localStorage.getItem<RecurringExpense[]>(this.RECURRING_KEY) || [];

    // Convert string dates back to Date objects
    const parsedExpenses = expenses.map(expense => ({
      ...expense,
      date: new Date(expense.date),
      createdAt: new Date(expense.createdAt),
      updatedAt: new Date(expense.updatedAt)
    }));

    this.expensesSubject.next(parsedExpenses);
    this.categoriesSubject.next(categories);
    this.budgetsSubject.next(budgets);
    this.recurringSubject.next(recurring);

    // Initialize default categories if none exist
    if (categories.length === 0) {
      this.initializeDefaultCategories();
    }
  }

  // Initialize default categories
  private initializeDefaultCategories(): void {
    const defaultCategories: ExpenseCategory[] = DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      id: uuidv4(),
      createdAt: new Date()
    }));

    this.categoriesSubject.next(defaultCategories);
    this.localStorage.setItem(this.CATEGORIES_KEY, defaultCategories);
  }

  // ====== EXPENSE OPERATIONS ======

  // Get filtered expenses
  getFilteredExpenses(): Observable<Expense[]> {
    return combineLatest([this.expenses$, this.filter$]).pipe(
      map(([expenses, filter]) => this.applyFilter(expenses, filter))
    );
  }

  // Apply filter to expenses
  private applyFilter(expenses: Expense[], filter: ExpenseFilter): Expense[] {
    return expenses.filter(expense => {
      // Date filter
      if (filter.dateFrom && expense.date < filter.dateFrom) return false;
      if (filter.dateTo && expense.date > filter.dateTo) return false;

      // Category filter
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        if (!filter.categoryIds.includes(expense.categoryId)) return false;
      }

      // Amount filter
      if (filter.minAmount !== undefined && expense.amount < filter.minAmount) return false;
      if (filter.maxAmount !== undefined && expense.amount > filter.maxAmount) return false;

      // Payment method filter
      if (filter.paymentMethods && filter.paymentMethods.length > 0) {
        if (!filter.paymentMethods.includes(expense.paymentMethod)) return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => expense.tags.includes(tag))) return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const titleMatch = expense.title.toLowerCase().includes(searchLower);
        const descriptionMatch = expense.description?.toLowerCase().includes(searchLower);
        const tagMatch = expense.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descriptionMatch && !tagMatch) return false;
      }

      return true;
    });
  }

  // Create expense
  createExpense(expenseData: CreateExpenseDto): Observable<Expense> {
    const expense: Expense = {
      ...expenseData,
      id: uuidv4(),
      date: new Date(expenseData.date),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentExpenses = this.expensesSubject.value;
    const updatedExpenses = [...currentExpenses, expense];
    
    this.expensesSubject.next(updatedExpenses);
    this.localStorage.setItem(this.EXPENSES_KEY, updatedExpenses);

    return new BehaviorSubject(expense).asObservable();
  }

  // Update expense
  updateExpense(id: string, updateData: UpdateExpenseDto): Observable<Expense | null> {
    const currentExpenses = this.expensesSubject.value;
    const expenseIndex = currentExpenses.findIndex(e => e.id === id);

    if (expenseIndex === -1) {
      return new BehaviorSubject(null).asObservable();
    }

    const updatedExpense: Expense = {
      ...currentExpenses[expenseIndex],
      ...updateData,
      updatedAt: new Date()
    };

    const updatedExpenses = [...currentExpenses];
    updatedExpenses[expenseIndex] = updatedExpense;

    this.expensesSubject.next(updatedExpenses);
    this.localStorage.setItem(this.EXPENSES_KEY, updatedExpenses);

    return new BehaviorSubject(updatedExpense).asObservable();
  }

  // Delete expense
  deleteExpense(id: string): Observable<boolean> {
    const currentExpenses = this.expensesSubject.value;
    const filteredExpenses = currentExpenses.filter(e => e.id !== id);

    this.expensesSubject.next(filteredExpenses);
    this.localStorage.setItem(this.EXPENSES_KEY, filteredExpenses);

    return new BehaviorSubject(true).asObservable();
  }

  // Get expense by ID
  getExpenseById(id: string): Observable<Expense | null> {
    return this.expenses$.pipe(
      map(expenses => expenses.find(e => e.id === id) || null)
    );
  }

  // ====== CATEGORY OPERATIONS ======

  // Create category
  createCategory(categoryData: CreateCategoryDto): Observable<ExpenseCategory> {
    const category: ExpenseCategory = {
      ...categoryData,
      id: uuidv4(),
      createdAt: new Date()
    };

    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = [...currentCategories, category];
    
    this.categoriesSubject.next(updatedCategories);
    this.localStorage.setItem(this.CATEGORIES_KEY, updatedCategories);

    return new BehaviorSubject(category).asObservable();
  }

  // Update category
  updateCategory(id: string, updateData: UpdateCategoryDto): Observable<ExpenseCategory | null> {
    const currentCategories = this.categoriesSubject.value;
    const categoryIndex = currentCategories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return new BehaviorSubject(null).asObservable();
    }

    const updatedCategory: ExpenseCategory = {
      ...currentCategories[categoryIndex],
      ...updateData
    };

    const updatedCategories = [...currentCategories];
    updatedCategories[categoryIndex] = updatedCategory;

    this.categoriesSubject.next(updatedCategories);
    this.localStorage.setItem(this.CATEGORIES_KEY, updatedCategories);

    return new BehaviorSubject(updatedCategory).asObservable();
  }

  // Delete category
  deleteCategory(id: string): Observable<boolean> {
    const currentCategories = this.categoriesSubject.value;
    const filteredCategories = currentCategories.filter(c => c.id !== id);

    this.categoriesSubject.next(filteredCategories);
    this.localStorage.setItem(this.CATEGORIES_KEY, filteredCategories);

    return new BehaviorSubject(true).asObservable();
  }

  // ====== BUDGET OPERATIONS ======

  // Create budget
  createBudget(budgetData: CreateBudgetDto): Observable<Budget> {
    const budget: Budget = {
      ...budgetData,
      id: uuidv4(),
      spent: 0,
      createdAt: new Date()
    };

    const currentBudgets = this.budgetsSubject.value;
    const updatedBudgets = [...currentBudgets, budget];
    
    this.budgetsSubject.next(updatedBudgets);
    this.localStorage.setItem(this.BUDGETS_KEY, updatedBudgets);

    return new BehaviorSubject(budget).asObservable();
  }

  // Update budget
  updateBudget(id: string, updateData: UpdateBudgetDto): Observable<Budget | null> {
    const currentBudgets = this.budgetsSubject.value;
    const budgetIndex = currentBudgets.findIndex(b => b.id === id);

    if (budgetIndex === -1) {
      return new BehaviorSubject(null).asObservable();
    }

    const updatedBudget: Budget = {
      ...currentBudgets[budgetIndex],
      ...updateData
    };

    const updatedBudgets = [...currentBudgets];
    updatedBudgets[budgetIndex] = updatedBudget;

    this.budgetsSubject.next(updatedBudgets);
    this.localStorage.setItem(this.BUDGETS_KEY, updatedBudgets);

    return new BehaviorSubject(updatedBudget).asObservable();
  }

  // Delete budget
  deleteBudget(id: string): Observable<boolean> {
    const currentBudgets = this.budgetsSubject.value;
    const filteredBudgets = currentBudgets.filter(b => b.id !== id);

    this.budgetsSubject.next(filteredBudgets);
    this.localStorage.setItem(this.BUDGETS_KEY, filteredBudgets);

    return new BehaviorSubject(true).asObservable();
  }

  // ====== STATISTICS AND ANALYTICS ======

  // Get expense statistics
  getExpenseStats(dateFrom?: Date, dateTo?: Date): Observable<ExpenseStats> {
    return combineLatest([this.expenses$, this.categories$]).pipe(
      map(([expenses, categories]) => {
        let filteredExpenses = expenses;

        // Apply date filter if provided
        if (dateFrom || dateTo) {
          filteredExpenses = expenses.filter(expense => {
            if (dateFrom && expense.date < dateFrom) return false;
            if (dateTo && expense.date > dateTo) return false;
            return true;
          });
        }

        // Calculate totals
        const totalExpenses = filteredExpenses
          .filter(e => e.amount < 0)
          .reduce((sum, e) => sum + Math.abs(e.amount), 0);

        const totalIncome = filteredExpenses
          .filter(e => e.amount > 0)
          .reduce((sum, e) => sum + e.amount, 0);

        const netAmount = totalIncome - totalExpenses;

        // Category breakdown
        const categoryBreakdown = this.calculateCategoryStats(filteredExpenses, categories);

        // Monthly trend
        const monthlyTrend = this.calculateMonthlyTrend(filteredExpenses);

        // Calculate averages
        const daysDiff = dateFrom && dateTo ? 
          Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))) : 
          30;

        const averageDaily = totalExpenses / daysDiff;
        const averageMonthly = totalExpenses / Math.max(1, monthlyTrend.length);

        return {
          totalExpenses,
          totalIncome,
          netAmount,
          categoryBreakdown,
          monthlyTrend,
          averageDaily,
          averageMonthly
        };
      })
    );
  }

  // Calculate category statistics
  private calculateCategoryStats(expenses: Expense[], categories: ExpenseCategory[]): CategoryStats[] {
    const categoryMap = new Map<string, CategoryStats>();

    // Initialize with categories
    categories.forEach(category => {
      categoryMap.set(category.id, {
        categoryId: category.id,
        categoryName: category.name,
        totalAmount: 0,
        transactionCount: 0,
        percentage: 0,
        budgetAmount: category.budget
      });
    });

    // Calculate totals
    const totalAmount = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);

    expenses.forEach(expense => {
      const stats = categoryMap.get(expense.categoryId);
      if (stats) {
        stats.totalAmount += Math.abs(expense.amount);
        stats.transactionCount++;
      }
    });

    // Calculate percentages
    const result: CategoryStats[] = [];
    categoryMap.forEach(stats => {
      if (stats.totalAmount > 0) {
        stats.percentage = (stats.totalAmount / totalAmount) * 100;
        result.push(stats);
      }
    });

    return result.sort((a, b) => b.totalAmount - a.totalAmount);
  }

  // Calculate monthly trend
  private calculateMonthlyTrend(expenses: Expense[]): MonthlyStats[] {
    const monthlyMap = new Map<string, MonthlyStats>();

    expenses.forEach(expense => {
      const monthKey = format(expense.date, 'yyyy-MM');
      const year = expense.date.getFullYear();
      const month = format(expense.date, 'MMM');

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month,
          year,
          totalExpenses: 0,
          totalIncome: 0,
          netAmount: 0,
          transactionCount: 0
        });
      }

      const monthStats = monthlyMap.get(monthKey)!;
      monthStats.transactionCount++;

      if (expense.amount < 0) {
        monthStats.totalExpenses += Math.abs(expense.amount);
      } else {
        monthStats.totalIncome += expense.amount;
      }
      
      monthStats.netAmount = monthStats.totalIncome - monthStats.totalExpenses;
    });

    return Array.from(monthlyMap.values()).sort((a, b) => 
      new Date(a.year, new Date(`${a.month} 1, ${a.year}`).getMonth()).getTime() - 
      new Date(b.year, new Date(`${b.month} 1, ${b.year}`).getMonth()).getTime()
    );
  }

  // Get dashboard data
  getDashboardData(): Observable<DashboardData> {
    return combineLatest([this.expenses$, this.categories$, this.budgets$, this.recurring$]).pipe(
      map(([expenses, categories, budgets, recurring]) => {
        // Recent expenses (last 10)
        const recentExpenses = expenses
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 10);

        // Calculate stats for current month
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        
        const currentMonthExpenses = expenses.filter(e => 
          isWithinInterval(e.date, { start: monthStart, end: monthEnd })
        );

        // Budget alerts
        const budgetAlerts = this.calculateBudgetAlerts(budgets, currentMonthExpenses, categories);

        // Upcoming recurring expenses
        const upcomingRecurring = recurring
          .filter(r => r.isActive && r.nextDueDate <= addMonths(now, 1))
          .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());

        return {
          recentExpenses,
          stats: this.calculateStatsFromExpenses(currentMonthExpenses, categories),
          budgetAlerts,
          upcomingRecurring
        };
      })
    );
  }

  // Calculate budget alerts
  private calculateBudgetAlerts(budgets: Budget[], expenses: Expense[], categories: ExpenseCategory[]): BudgetAlert[] {
    const alerts: BudgetAlert[] = [];

    budgets.forEach(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      if (!category) return;

      const spent = expenses
        .filter(e => e.categoryId === budget.categoryId && e.amount < 0)
        .reduce((sum, e) => sum + Math.abs(e.amount), 0);

      const percentage = (spent / budget.amount) * 100;

      if (percentage >= budget.alertThreshold) {
        let alertType: AlertType = AlertType.INFO;
        let message = `You've spent ${percentage.toFixed(1)}% of your ${category.name} budget`;

        if (percentage >= 90) {
          alertType = AlertType.DANGER;
          message = `You've exceeded 90% of your ${category.name} budget!`;
        } else if (percentage >= 75) {
          alertType = AlertType.WARNING;
          message = `You're approaching your ${category.name} budget limit`;
        }

        alerts.push({
          budgetId: budget.id,
          categoryName: category.name,
          budgetAmount: budget.amount,
          spentAmount: spent,
          percentage,
          alertType,
          message
        });
      }
    });

    return alerts;
  }

  // Calculate stats from expenses
  private calculateStatsFromExpenses(expenses: Expense[], categories: ExpenseCategory[]): ExpenseStats {
    const totalExpenses = expenses
      .filter(e => e.amount < 0)
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);

    const totalIncome = expenses
      .filter(e => e.amount > 0)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown: this.calculateCategoryStats(expenses, categories),
      monthlyTrend: this.calculateMonthlyTrend(expenses),
      averageDaily: totalExpenses / 30,
      averageMonthly: totalExpenses
    };
  }

  // ====== FILTER METHODS ======

  // Set filter
  setFilter(filter: ExpenseFilter): void {
    this.filterSubject.next(filter);
  }

  // Clear filter
  clearFilter(): void {
    this.filterSubject.next({});
  }

  // ====== UTILITY METHODS ======

  // Export data
  exportData(): { expenses: Expense[], categories: ExpenseCategory[], budgets: Budget[] } {
    return {
      expenses: this.expensesSubject.value,
      categories: this.categoriesSubject.value,
      budgets: this.budgetsSubject.value
    };
  }

  // Import data
  importData(data: { expenses: Expense[], categories: ExpenseCategory[], budgets: Budget[] }): void {
    this.expensesSubject.next(data.expenses);
    this.categoriesSubject.next(data.categories);
    this.budgetsSubject.next(data.budgets);

    this.localStorage.setItem(this.EXPENSES_KEY, data.expenses);
    this.localStorage.setItem(this.CATEGORIES_KEY, data.categories);
    this.localStorage.setItem(this.BUDGETS_KEY, data.budgets);
  }

  // Clear all data
  clearAllData(): void {
    this.expensesSubject.next([]);
    this.categoriesSubject.next([]);
    this.budgetsSubject.next([]);
    this.recurringSubject.next([]);

    this.localStorage.removeItem(this.EXPENSES_KEY);
    this.localStorage.removeItem(this.CATEGORIES_KEY);
    this.localStorage.removeItem(this.BUDGETS_KEY);
    this.localStorage.removeItem(this.RECURRING_KEY);

    this.initializeDefaultCategories();
  }
}