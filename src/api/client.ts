import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sssssssssss-4.onrender.com/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage key
const TOKEN_KEY = 'ai-finance-token';

// Request interceptor - automatically add JWT token from localStorage
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors (unauthorized) and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem(TOKEN_KEY);
      // Redirect to login page (adjust path as needed)
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== TYPE DEFINITIONS ====================

export interface SignupPayload {
  email: string;
  password: string;
  name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export interface IncomePayload {
  amount: number;
  category: string;
  date?: string; // ISO date string
  notes?: string;
  source?: string;
}

export interface Income {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  source?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpensePayload {
  amount: number;
  category: string;
  date?: string; // ISO date string
  notes?: string;
  paymentMethod?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  paymentMethod?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalPayload {
  name: string;
  targetAmount: number;
  timeline: number; // months
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  progress?: number; // percentage
  timeline: number;
  description?: string;
  priority?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentPayload {
  type: string; // e.g., 'stocks', 'bonds', 'mutual_fund', 'etf', 'crypto', etc.
  amount: number;
  startDate?: string; // ISO date string
  expectedReturn?: number; // percentage
  riskLevel?: 'low' | 'medium' | 'high';
  ticker?: string;
  notes?: string;
}

export interface Investment {
  id: string;
  type: string;
  amount: number;
  startDate: string;
  expectedReturn?: number;
  riskLevel?: string;
  ticker?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertPreferences {
  lowBalanceThreshold?: number;
  reminderDays?: number[]; // Array of day numbers (0-6 for Sunday-Saturday)
  notificationChannels?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  id?: string;
  userId?: string;
}

export interface MonthlyReportParams {
  month: number; // 1-12
  year: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totals: {
    income: number;
    expenses: number;
    savings: number;
    balance: number;
  };
  chartsData: {
    incomeByCategory?: Array<{ category: string; amount: number }>;
    expenseByCategory?: Array<{ category: string; amount: number }>;
  };
}

export interface YearlyReportParams {
  year: number;
}

export interface YearlyReport {
  year: number;
  monthlyBreakdown: Array<{
    month: number;
    income: number;
    expenses: number;
    savings: number;
  }>;
  totals: {
    income: number;
    expenses: number;
    savings: number;
  };
}

export interface OverviewReport {
  balance: number;
  savingsRate: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  period?: string;
}

export interface InsightsPayload {
  incomeList?: Income[];
  expenseList?: Expense[];
  goalsList?: Goal[];
}

export interface Insight {
  type: 'warning' | 'success' | 'tip';
  message: string;
}

export interface InsightsResponse {
  insights: Insight[];
  provider?: string;
}

export interface CategorySuggestionPayload {
  expenseDescription: string;
}

export interface CategorySuggestionResponse {
  category: string;
  confidence?: number;
}

export interface IncomeListParams {
  month?: number;
  year?: number;
}

export interface ExpenseListParams {
  month?: number;
  year?: number;
}

// ==================== AUTH ENDPOINTS ====================

/**
 * Sign up a new user
 */
export const signup = (payload: SignupPayload) =>
  api.post<AuthResponse>('/auth/signup', payload);

/**
 * Login existing user
 */
export const login = (payload: LoginPayload) =>
  api.post<AuthResponse>('/auth/login', payload);

/**
 * Logout current user
 */
export const logout = () => api.post('/auth/logout');

/**
 * Fetch current user profile
 */
export const fetchProfile = () => api.get<Profile>('/auth/profile');

// ==================== INCOME ENDPOINTS ====================

/**
 * Create a new income entry
 */
export const createIncome = (payload: IncomePayload) =>
  api.post<Income>('/income', payload);

/**
 * List income entries with optional month/year filters
 */
export const listIncome = (params?: IncomeListParams) =>
  api.get<{ incomes: Income[] }>('/income', { params });

/**
 * Update an existing income entry
 */
export const updateIncome = (id: string, payload: Partial<IncomePayload>) =>
  api.put<Income>(`/income/${id}`, payload);

/**
 * Delete an income entry
 */
export const deleteIncome = (id: string) => api.delete(`/income/${id}`);

// ==================== EXPENSE ENDPOINTS ====================

/**
 * Create a new expense entry
 */
export const createExpense = (payload: ExpensePayload) =>
  api.post<Expense>('/expense', payload);

/**
 * List expense entries with optional month/year filters
 */
export const listExpense = (params?: ExpenseListParams) =>
  api.get<{ expenses: Expense[] }>('/expense', { params });

/**
 * Update an existing expense entry
 */
export const updateExpense = (id: string, payload: Partial<ExpensePayload>) =>
  api.put<Expense>(`/expense/${id}`, payload);

/**
 * Delete an expense entry
 */
export const deleteExpense = (id: string) => api.delete(`/expense/${id}`);

// ==================== GOALS ENDPOINTS ====================

/**
 * Create a new financial goal
 */
export const createGoal = (payload: GoalPayload) =>
  api.post<Goal>('/goals', payload);

/**
 * List all goals for the current user
 */
export const listGoals = () => api.get<{ goals: Goal[] }>('/goals');

/**
 * Update an existing goal
 */
export const updateGoal = (id: string, payload: Partial<GoalPayload>) =>
  api.put<Goal>(`/goals/${id}`, payload);

/**
 * Delete a goal
 */
export const deleteGoal = (id: string) => api.delete(`/goals/${id}`);

// ==================== INVESTMENTS ENDPOINTS ====================

/**
 * Create a new investment entry
 */
export const createInvestment = (payload: InvestmentPayload) =>
  api.post<Investment>('/investments', payload);

/**
 * List all investments for the current user
 */
export const listInvestments = () =>
  api.get<{ investments: Investment[]; total: number }>('/investments');

/**
 * Update an existing investment
 */
export const updateInvestment = (
  id: string,
  payload: Partial<InvestmentPayload>
) => api.put<Investment>(`/investments/${id}`, payload);

/**
 * Delete an investment
 */
export const deleteInvestment = (id: string) =>
  api.delete(`/investments/${id}`);

// ==================== ALERT PREFERENCES ENDPOINTS ====================

/**
 * Fetch alert preferences for the current user
 */
export const fetchAlertPreferences = () =>
  api.get<AlertPreferences>('/alerts');

/**
 * Update alert preferences
 */
export const updateAlertPreferences = (payload: AlertPreferences) =>
  api.put<AlertPreferences>('/alerts', payload);

// ==================== REPORTS ENDPOINTS ====================

/**
 * Fetch overview report (balance, savings rate, etc.)
 */
export const fetchOverview = () => api.get<OverviewReport>('/reports/overview');

/**
 * Fetch monthly report with detailed breakdown
 */
export const fetchMonthlyReport = (params: MonthlyReportParams) =>
  api.get<MonthlyReport>('/reports/monthly', { params });

/**
 * Fetch yearly report with month-by-month breakdown
 */
export const fetchYearlyReport = (params: YearlyReportParams) =>
  api.get<YearlyReport>('/reports/yearly', { params });

// ==================== AI INSIGHTS ENDPOINTS ====================

/**
 * Generate AI insights based on current financial data
 */
export const generateInsights = (payload: InsightsPayload) =>
  api.post<InsightsResponse>('/ai/insights', payload);

/**
 * Auto-categorize an expense description
 */
export const autoCategorizeExpense = (payload: CategorySuggestionPayload) =>
  api.post<CategorySuggestionResponse>('/ai/category', payload);

// ==================== UTILITY FUNCTIONS ====================

/**
 * Set or remove the authentication token in localStorage
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Get the current authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Clear authentication token and redirect to login
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
};

/**
 * Check if user is authenticated (has token)
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// Export the api instance for advanced usage if needed
export { api, TOKEN_KEY };
export default api;

