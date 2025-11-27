# API Client

This module provides a complete Axios-based API client for the AI Finance application, covering all backend endpoints.

## Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install axios
   ```

2. **Configure API URL**:
   Create a `.env` file in the project root with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   Or set it in your environment. If not set, it defaults to `http://localhost:5000/api`.

## Usage

### Basic Example

```typescript
import { login, fetchProfile, listIncome, createIncome } from '@/api/client';

// Login
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login({ email, password });
    const { token, user } = response.data;
    
    // Store token (automatically done by interceptor, but you can also use setAuthToken)
    setAuthToken(token);
    
    console.log('Logged in:', user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Fetch user profile
const loadProfile = async () => {
  try {
    const response = await fetchProfile();
    console.log('Profile:', response.data);
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

// List income entries for current month
const loadIncome = async () => {
  try {
    const today = new Date();
    const response = await listIncome({
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    });
    console.log('Income entries:', response.data.incomes);
  } catch (error) {
    console.error('Failed to load income:', error);
  }
};

// Create new income entry
const addIncome = async () => {
  try {
    const response = await createIncome({
      amount: 5000,
      category: 'Salary',
      date: new Date().toISOString(),
      notes: 'Monthly salary',
    });
    console.log('Created income:', response.data);
  } catch (error) {
    console.error('Failed to create income:', error);
  }
};
```

### React Component Example

```typescript
import { useEffect, useState } from 'react';
import { listIncome, createIncome, deleteIncome, updateIncome } from '@/api/client';
import type { Income } from '@/api/client';

function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const { data } = await listIncome({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });
      setIncomes(data.incomes);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load income');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async (incomeData: any) => {
    try {
      await createIncome(incomeData);
      await loadIncomes(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create income');
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome(id);
      await loadIncomes(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete income');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Income</h1>
      {incomes.map((income) => (
        <div key={income.id}>
          {income.category}: ${income.amount}
          <button onClick={() => handleDeleteIncome(income.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Authentication

The API client automatically handles authentication:

1. **Token Storage**: Tokens are stored in `localStorage` with the key `ai-finance-token`
2. **Automatic Injection**: The JWT token is automatically added to all requests via the `Authorization: Bearer <token>` header
3. **401 Handling**: If a request returns 401 (Unauthorized), the token is cleared and the user is redirected to `/login`

### Manual Token Management

```typescript
import { setAuthToken, getAuthToken, isAuthenticated, clearAuth } from '@/api/client';

// Set token manually
setAuthToken('your-jwt-token');

// Get current token
const token = getAuthToken();

// Check if authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Clear auth and redirect to login
clearAuth();
```

## Available Endpoints

### Auth
- `signup(payload)` - Create new user account
- `login(payload)` - Login existing user
- `logout()` - Logout current user
- `fetchProfile()` - Get current user profile

### Income
- `createIncome(payload)` - Create income entry
- `listIncome(params?)` - List income entries (with optional month/year filters)
- `updateIncome(id, payload)` - Update income entry
- `deleteIncome(id)` - Delete income entry

### Expense
- `createExpense(payload)` - Create expense entry
- `listExpense(params?)` - List expense entries (with optional month/year filters)
- `updateExpense(id, payload)` - Update expense entry
- `deleteExpense(id)` - Delete expense entry

### Goals
- `createGoal(payload)` - Create financial goal
- `listGoals()` - List all goals
- `updateGoal(id, payload)` - Update goal
- `deleteGoal(id)` - Delete goal

### Investments
- `createInvestment(payload)` - Create investment entry
- `listInvestments()` - List all investments
- `updateInvestment(id, payload)` - Update investment
- `deleteInvestment(id)` - Delete investment

### Alerts
- `fetchAlertPreferences()` - Get alert preferences
- `updateAlertPreferences(payload)` - Update alert preferences

### Reports
- `fetchOverview()` - Get overview report
- `fetchMonthlyReport(params)` - Get monthly report
- `fetchYearlyReport(params)` - Get yearly report

### AI Insights
- `generateInsights(payload)` - Generate AI-powered financial insights
- `autoCategorizeExpense(payload)` - Auto-categorize expense description

## Error Handling

The API client includes automatic error handling:

- **401 Unauthorized**: Automatically clears token and redirects to login
- **Other errors**: Can be caught in try/catch blocks

Example:

```typescript
try {
  const response = await createIncome({ amount: 100, category: 'Test' });
  // Success
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    console.error('Error:', error.response.data.message);
    console.error('Status:', error.response.status);
  } else {
    // Request failed (network error, etc.)
    console.error('Network error:', error.message);
  }
}
```

## TypeScript Types

All request/response types are exported for use in your components:

```typescript
import type {
  Income,
  Expense,
  Goal,
  Investment,
  Profile,
  AuthResponse,
  MonthlyReport,
  YearlyReport,
  OverviewReport,
  Insight,
  AlertPreferences,
} from '@/api/client';
```

