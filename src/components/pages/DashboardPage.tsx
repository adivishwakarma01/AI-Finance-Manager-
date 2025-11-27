import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Brain, DollarSign, PieChart, AlertCircle, ArrowUpRight, ArrowDownRight, Plus, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BaseCrudService } from '@/integrations';
import { Transactions, FinancialGoals } from '@/entities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import Header from '@/components/Header';
import { useMember } from '@/integrations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { member } = useMember();
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [goals, setGoals] = useState<FinancialGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickDescription, setQuickDescription] = useState('');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // After data load, auto-generate AI insights once
  useEffect(() => {
    if (!loading) {
      // Trigger AI insights generation once when dashboard data is ready
      generateAiInsights();
    }
  }, [loading]);

  const loadData = async () => {
    setLoading(true);
    const [transactionsData, goalsData] = await Promise.all([
      BaseCrudService.getAll<Transactions>('transactions'),
      BaseCrudService.getAll<FinancialGoals>('financialgoals')
    ]);
    setTransactions(transactionsData.items);
    setGoals(goalsData.items);
    setLoading(false);
  };

  // Calculate metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  const yesterdaySpend = transactions
    .filter(t => t.type === 'expense')
    .filter(t => {
      const d = new Date(t.date || '');
      const now = new Date();
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
    .slice(0, 5);

  // Expense by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + (t.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Monthly spending trend
  const monthlyData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const date = new Date(t.date || '');
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + (t.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const spendingTrend = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount
  }));

  const COLORS = ['#3567fd', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

  // AI Insights (stateful)
  const [aiInsights, setAiInsights] = useState([
    {
      type: 'warning',
      message: `Your dining expenses are 25% higher than average. Consider meal planning to save $${Math.round(totalExpenses * 0.15)}/month.`,
      icon: AlertCircle,
      color: 'text-yellow-400'
    },
    {
      type: 'success',
      message: `Great job! You're on track to save $${Math.round(balance * 0.2)} more this month.`,
      icon: TrendingUp,
      color: 'text-primary'
    },
    {
      type: 'tip',
      message: 'Based on your income, you could invest $500/month in low-risk funds for long-term growth.',
      icon: Brain,
      color: 'text-iconcolor'
    }
  ]);
  
  const [aiGenerating, setAiGenerating] = useState(false);
  const generateAiInsights = async () => {
    try {
      setAiGenerating(true);
  
      const summary = {
        totalIncome,
        totalExpenses,
        balance,
        savingsRate: Number(savingsRate.toFixed(2)),
        topCategories: Object.entries(expensesByCategory)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, amount]) => ({ name, amount })),
        recentTransactions: recentTransactions.map(t => ({
          date: t.date,
          type: t.type,
          category: t.category,
          amount: t.amount,
          description: t.description
        }))
      };
  
      const apiBase = import.meta.env.VITE_API_URL as string | undefined;
      const derivedAdvisor = apiBase ? apiBase.replace(/\/api$/, '') : undefined;
      const ADVISOR_URL = import.meta.env.VITE_ADVISOR_URL || derivedAdvisor || 'http://localhost:8787';
      const response = await fetch(`${ADVISOR_URL}/api/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary })
      });
  
      if (!response.ok) {
        // Graceful client-side fallback: simple, practical tips
        const generic = [
          { type: 'tip', message: 'Try setting category budgets and automate savings right after payday.' },
          { type: 'tip', message: 'Review subscriptions quarterly to cut recurring costs.' },
          { type: 'tip', message: 'Track your top spending categories weekly to stay on target.' }
        ];
        setAiInsights(generic.map(item => ({
          type: item.type as any,
          message: item.message,
          icon: item.type === 'warning' ? AlertCircle : item.type === 'success' ? TrendingUp : Brain,
          color: item.type === 'warning' ? 'text-yellow-400' : item.type === 'success' ? 'text-primary' : 'text-iconcolor'
        })));
        return;
      }
  
      const data = await response.json();
      const parsed = (data?.insights || []) as Array<{ type: 'warning' | 'success' | 'tip'; message: string }>;
  
      const mapped = parsed.map(item => ({
        type: item.type,
        message: item.message,
        icon: item.type === 'warning' ? AlertCircle : item.type === 'success' ? TrendingUp : Brain,
        color: item.type === 'warning' ? 'text-yellow-400' : item.type === 'success' ? 'text-primary' : 'text-iconcolor'
      }));
  
      setAiInsights(mapped);
    } catch (e: any) {
      console.error('Failed to generate AI insights', e);
      // Final safety fallback
      const generic = [
        { type: 'tip', message: 'Consider a weekly spending review to keep expenses aligned with goals.' },
        { type: 'tip', message: 'Automate a small monthly transfer to savings to build momentum.' },
        { type: 'tip', message: 'Cap discretionary categories and seek cheaper alternatives for top spend areas.' }
      ];
      setAiInsights(generic.map(item => ({
        type: item.type as any,
        message: item.message,
        icon: item.type === 'warning' ? AlertCircle : item.type === 'success' ? TrendingUp : Brain,
        color: item.type === 'warning' ? 'text-yellow-400' : item.type === 'success' ? 'text-primary' : 'text-iconcolor'
      })));
    } finally {
      setAiGenerating(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (totalIncome > 0 && savingsRate < 5) {
        toast({ title: 'High spending detected', description: 'Savings rate is low. Consider capping discretionary categories.' });
      }
    }
  }, [loading]);

  const quickSave = async () => {
    const amountNum = parseFloat(quickAmount);
    if (!amountNum || amountNum <= 0 || !quickCategory.trim()) {
      toast({ title: 'Invalid entry', description: 'Enter amount and category.' });
      return;
    }
    const newTransaction: Transactions = {
      _id: crypto.randomUUID(),
      amount: amountNum,
      type: 'expense',
      date: new Date().toISOString(),
      category: quickCategory.trim(),
      description: quickDescription.trim()
    };
    await BaseCrudService.create('transactions', newTransaction);
    await loadData();
    setQuickOpen(false);
    setQuickAmount('');
    setQuickCategory('');
    setQuickDescription('');
    toast({ title: 'Expense added', description: 'Saved to your transactions.' });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0]?.clientX || 0);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    if (touchStartX === null) return;
    const dx = endX - touchStartX;
    if (dx < -50) {
      setQuickOpen(true);
    } else if (dx > 50) {
      const el = document.getElementById('insights');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setTouchStartX(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-secondary-foreground/70">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pt-20 sm:pt-24" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-4xl font-bold mb-2">
            Welcome back{member?.profile?.nickname ? `, ${member.profile.nickname}` : ''}!
          </h1>
          <p className="font-paragraph text-secondary-foreground/70">
            Here's your financial overview for today
          </p>
        </motion.div>

        {isMobile && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-paragraph text-sm text-secondary-foreground/70">Yesterday's spend</p>
                  <p className="font-heading text-xl font-bold">${yesterdaySpend.toLocaleString()}</p>
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/80">{savingsRate < 5 ? 'Spending high vs income. Reduce discretionary categories.' : 'On track. Keep saving consistently.'}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Balance</p>
                <h3 className="font-heading text-3xl font-bold text-primary">
                  ${balance.toLocaleString()}
                </h3>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Income</p>
                <h3 className="font-heading text-3xl font-bold">
                  ${totalIncome.toLocaleString()}
                </h3>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Expenses</p>
                <h3 className="font-heading text-3xl font-bold">
                  ${totalExpenses.toLocaleString()}
                </h3>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Savings Rate</p>
                <h3 className="font-heading text-3xl font-bold">
                  {savingsRate.toFixed(1)}%
                </h3>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div id="insights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-heading">AI Financial Insights</span>
              </CardTitle>
              {/* Generate button removed */}
              {/* Removed error text for cleaner UX */}
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 bg-secondary/50 rounded-xl p-4">
                  <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                  <p className="font-paragraph text-sm text-secondary-foreground/90">{insight.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
          {/* Spending Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {spendingTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={spendingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#E0E7FF' }}
                      />
                      <Bar dataKey="amount" fill="#3567fd" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="font-paragraph text-secondary-foreground/60">No spending data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Expense Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="font-paragraph text-secondary-foreground/60">No expense data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading">Recent Transactions</CardTitle>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-3 bg-background/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-5 h-5 text-green-400" />
                            ) : (
                              <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-heading text-sm font-semibold">{transaction.description || 'Transaction'}</p>
                            <p className="font-paragraph text-xs text-secondary-foreground/60">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-heading text-sm font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                          </p>
                          <p className="font-paragraph text-xs text-secondary-foreground/60">
                            {new Date(transaction.date || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="font-paragraph text-secondary-foreground/60 text-center py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Financial Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading">Financial Goals</CardTitle>
                <Link to="/goals">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length > 0 ? (
                    goals.slice(0, 3).map((goal) => {
                      const progress = ((goal.currentProgress || 0) / (goal.targetAmount || 1)) * 100;
                      return (
                        <div key={goal._id} className="p-4 bg-background/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-heading text-sm font-semibold">{goal.goalName}</h4>
                            <span className="font-paragraph text-xs text-secondary-foreground/60">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={progress} className="mb-2" />
                          <div className="flex items-center justify-between">
                            <p className="font-paragraph text-xs text-secondary-foreground/60">
                              ${goal.currentProgress?.toLocaleString()} / ${goal.targetAmount?.toLocaleString()}
                            </p>
                            {goal.deadline && (
                              <p className="font-paragraph text-xs text-secondary-foreground/60">
                                Due: {new Date(goal.deadline).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="font-paragraph text-secondary-foreground/60 text-center py-8">No goals set yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          <Link to="/transactions">
            <Card className="bg-secondary border-none hover:bg-secondary/80 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <PieChart className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">Add Transaction</h3>
                <p className="font-paragraph text-sm text-secondary-foreground/70">Track your income and expenses</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/goals">
            <Card className="bg-secondary border-none hover:bg-secondary/80 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">Set a Goal</h3>
                <p className="font-paragraph text-sm text-secondary-foreground/70">Plan your financial future</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/investments">
            <Card className="bg-secondary border-none hover:bg-secondary/80 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-heading text-lg font-semibold mb-2">Explore Investments</h3>
                <p className="font-paragraph text-sm text-secondary-foreground/70">Grow your wealth smartly</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
        {isMobile && (
          <div className="fixed bottom-4 left-0 right-0 flex items-center justify-center">
            <div className="bg-secondary/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <Button variant="ghost" className="text-secondary-foreground/80" onClick={() => window.location.href = '/dashboard'}>
                <TrendingUp className="w-5 h-5" />
              </Button>
              <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-5 h-5 mr-2" /> Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-heading">Quick Add Expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="qa-amount">Amount</Label>
                      <Input id="qa-amount" type="number" value={quickAmount} onChange={(e) => setQuickAmount(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qa-category">Category</Label>
                      <Input id="qa-category" value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)} placeholder="Food, Transport, etc." />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="qa-desc">Description</Label>
                      <Input id="qa-desc" value={quickDescription} onChange={(e) => setQuickDescription(e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={quickSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" className="text-secondary-foreground/80" onClick={() => document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' })}>
                <LineChart className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
