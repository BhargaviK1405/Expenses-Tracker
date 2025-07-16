export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: Date;
  description?: string;
  paymentMethod: PaymentMethod;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  tags: string[];
  receipt?: string; // base64 encoded image or file path
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  budget?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  spent: number;
  isActive: boolean;
  alertThreshold: number; // percentage (0-100)
  createdAt: Date;
}

export interface RecurringExpense {
  id: string;
  templateExpense: Omit<Expense, 'id' | 'date' | 'createdAt' | 'updatedAt'>;
  frequency: RecurringFrequency;
  nextDueDate: Date;
  lastProcessedDate?: Date;
  isActive: boolean;
  endDate?: Date;
  createdAt: Date;
}

export interface ExpenseFilter {
  dateFrom?: Date;
  dateTo?: Date;
  categoryIds?: string[];
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: PaymentMethod[];
  tags?: string[];
  searchTerm?: string;
}

export interface ExpenseStats {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  categoryBreakdown: CategoryStats[];
  monthlyTrend: MonthlyStats[];
  averageDaily: number;
  averageMonthly: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
  budgetAmount?: number;
  budgetUsed?: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  transactionCount: number;
}

export interface DashboardData {
  recentExpenses: Expense[];
  stats: ExpenseStats;
  budgetAlerts: BudgetAlert[];
  upcomingRecurring: RecurringExpense[];
}

export interface BudgetAlert {
  budgetId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  alertType: AlertType;
  message: string;
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CHECK = 'check',
  OTHER = 'other'
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum BudgetPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum AlertType {
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info'
}

export enum TransactionType {
  EXPENSE = 'expense',
  INCOME = 'income'
}

// Utility types for forms and API
export type CreateExpenseDto = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseDto = Partial<CreateExpenseDto>;
export type CreateCategoryDto = Omit<ExpenseCategory, 'id' | 'createdAt'>;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;
export type CreateBudgetDto = Omit<Budget, 'id' | 'spent' | 'createdAt'>;
export type UpdateBudgetDto = Partial<CreateBudgetDto>;

// Default categories
export const DEFAULT_CATEGORIES: Omit<ExpenseCategory, 'id' | 'createdAt'>[] = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: 'restaurant', budget: 500, isActive: true },
  { name: 'Transportation', color: '#4ECDC4', icon: 'directions_car', budget: 200, isActive: true },
  { name: 'Shopping', color: '#45B7D1', icon: 'shopping_cart', budget: 300, isActive: true },
  { name: 'Entertainment', color: '#96CEB4', icon: 'movie', budget: 150, isActive: true },
  { name: 'Health & Fitness', color: '#FECA57', icon: 'fitness_center', budget: 200, isActive: true },
  { name: 'Utilities', color: '#FF9FF3', icon: 'electrical_services', budget: 250, isActive: true },
  { name: 'Education', color: '#54A0FF', icon: 'school', budget: 100, isActive: true },
  { name: 'Travel', color: '#5F27CD', icon: 'flight', budget: 400, isActive: true },
  { name: 'Income', color: '#00D2D3', icon: 'attach_money', isActive: true },
  { name: 'Other', color: '#747D8C', icon: 'more_horiz', isActive: true }
];

// Chart data interfaces
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins?: any;
  scales?: any;
}