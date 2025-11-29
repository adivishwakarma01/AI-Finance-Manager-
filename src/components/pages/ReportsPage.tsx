import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BaseCrudService } from '@/integrations';
import { Transactions, FinancialGoals } from '@/entities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import Header from '@/components/Header';

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [goals, setGoals] = useState<FinancialGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const key = params.get('advisorKey');
      if (key) {
        localStorage.setItem('advisor_api_key', key);
      }
    } catch {}
  }, []);

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

  // Filter transactions by time range
  const getFilteredTransactions = () => {
    const now = new Date();
    let filtered = [...transactions];

    if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date || '') >= thirtyDaysAgo);
    } else if (timeRange === '90days') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date || '') >= ninetyDaysAgo);
    } else if (timeRange === 'year') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date || '') >= oneYearAgo);
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate metrics
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100) : 0;

  // Monthly trend data
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date || '');
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
    }
    
    if (t.type === 'income') {
      acc[monthYear].income += t.amount || 0;
    } else {
      acc[monthYear].expenses += t.amount || 0;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const monthlyTrend = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  // Category breakdown
  const categoryData = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.category || 'Other';
      acc[category] = (acc[category] || 0) + (t.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));

  // Income vs Expense comparison
  const comparisonData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpenses },
    { name: 'Savings', value: netSavings }
  ];

  // Goals progress
  const goalsProgress = goals.map(goal => ({
    name: goal.goalName || 'Unnamed Goal',
    progress: ((goal.currentProgress || 0) / (goal.targetAmount || 1)) * 100,
    current: goal.currentProgress || 0,
    target: goal.targetAmount || 0
  }));

  const COLORS = ['#3567fd', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

  const contextSummary = useMemo(() => {
    const recent = [...filteredTransactions]
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 10)
      .map(t => ({ date: t.date, type: t.type, category: t.category, amount: t.amount, description: t.description }));
    const topCats = categoryChartData
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map(c => ({ name: c.name, amount: c.value }));
    const goalsBrief = goals.map(g => ({ name: g.goalName, target: g.targetAmount, current: g.currentProgress }));
    return {
      totals: { income: totalIncome, expenses: totalExpenses, netSavings, savingsRate: Number(savingsRate.toFixed(2)) },
      topCategories: topCats,
      recentTransactions: recent,
      goals: goalsBrief,
      timeRange,
    };
  }, [filteredTransactions, categoryChartData, goals, totalIncome, totalExpenses, netSavings, savingsRate, timeRange]);

  const fetchAIInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      setAiInsights([]);
      const apiBase = import.meta.env.VITE_API_URL as string | undefined;
      const derivedAdvisor = apiBase ? apiBase.replace(/\/api$/, '') : undefined;
      const INSIGHTS_URL = import.meta.env.VITE_ADVISOR_URL || derivedAdvisor || 'https://dddda.onrender.com';
      const ADVISOR_API_KEY = (localStorage.getItem('advisor_api_key') || import.meta.env.VITE_ADVISOR_API_KEY) as string | undefined;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (ADVISOR_API_KEY) headers['Authorization'] = `Bearer ${ADVISOR_API_KEY}`;
      const res = await fetch(`${INSIGHTS_URL}/api/insights`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ context: contextSummary })
      });
      if (!res.ok) {
        if (ADVISOR_API_KEY) {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(ADVISOR_API_KEY)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `You are a finance analyst. Context: ${JSON.stringify(contextSummary)}. Return 3-5 concise insights and practical actions tailored to the data.` }
                  ]
                }
              ]
            })
          });
          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const text = geminiData?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
            const tips = text.split(/\n|\r/).map((t: string) => t.trim()).filter(Boolean).slice(0, 6);
            setAiInsights(tips.length ? tips : [
              'Maintain a consistent budget review cadence and track top 3 categories.',
            ]);
            return;
          }
        }
        setAiInsights([
          `Focus on reducing ${categoryChartData[0]?.name || 'discretionary'} by 10–15% to lift savings rate.`,
          netSavings >= 0 ? 'Consider automating transfers to an emergency fund each payday.' : 'Pause non-essential spending until net savings turns positive.',
          goals.length ? 'Review goal timelines and bump contributions on highest priority goals.' : 'Set a clear savings goal to track progress.',
        ]);
        return;
      }
      const data = await res.json();
      const tips: string[] = Array.isArray(data?.insights) ? data.insights : (data?.message ? [data.message] : []);
      setAiInsights(tips.length ? tips : [
        'Maintain a consistent budget review cadence and track top 3 categories.',
      ]);
    } catch (e) {
      const ADVISOR_API_KEY = (localStorage.getItem('advisor_api_key') || import.meta.env.VITE_ADVISOR_API_KEY) as string | undefined;
      if (ADVISOR_API_KEY) {
        try {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(ADVISOR_API_KEY)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `You are a finance analyst. Context: ${JSON.stringify(contextSummary)}. Return 3-5 concise insights and practical actions tailored to the data.` }
                  ]
                }
              ]
            })
          });
          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const text = geminiData?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n') || '';
            const tips = text.split(/\n|\r/).map((t: string) => t.trim()).filter(Boolean).slice(0, 6);
            setAiInsights(tips.length ? tips : [
              'Maintain a consistent budget review cadence and track top 3 categories.',
            ]);
            return;
          }
        } catch {}
      }
      setAiInsights([
        `Cut ${categoryChartData[0]?.name || 'variable'} spend slightly and redirect to savings.`,
        'Automate a small weekly transfer to build momentum.',
      ]);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchAIInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, timeRange, transactions.length]);

  const handleExportReport = () => {
    const wb = XLSX.utils.book_new();

    const summaryRows = [
      { Metric: 'Total Income', Value: totalIncome },
      { Metric: 'Total Expenses', Value: totalExpenses },
      { Metric: 'Net Savings', Value: netSavings },
      { Metric: 'Savings Rate (%)', Value: Number(savingsRate.toFixed(2)) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const txRows = filteredTransactions.map(t => ({
      Date: t.date ?? '',
      Type: t.type ?? '',
      Category: t.category ?? '',
      Amount: t.amount ?? 0,
      Notes: t.notes ?? '',
      Source: (t as any).source ?? '',
    }));
    const wsTx = XLSX.utils.json_to_sheet(txRows);
    XLSX.utils.book_append_sheet(wb, wsTx, 'Transactions');

    const goalsRows = goalsProgress.map(g => ({
      Goal: g.name,
      ProgressPercent: Number(g.progress.toFixed(2)),
      Current: g.current,
      Target: g.target,
    }));
    const wsGoals = XLSX.utils.json_to_sheet(goalsRows);
    XLSX.utils.book_append_sheet(wb, wsGoals, 'Goals');

    const trendRows = monthlyTrend.map(m => ({ Month: m.month, Income: m.income, Expenses: m.expenses }));
    const wsTrend = XLSX.utils.json_to_sheet(trendRows);
    XLSX.utils.book_append_sheet(wb, wsTrend, 'Monthly Trend');

    const categoryRows = categoryChartData.map(c => ({ Category: c.name, Amount: c.value }));
    const wsCategory = XLSX.utils.json_to_sheet(categoryRows);
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Categories');

    const filename = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-secondary-foreground/70">Generating reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Financial Reports</h1>
            <p className="font-paragraph text-secondary-foreground/70">
              Comprehensive analysis of your financial data
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="bg-secondary border-none w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-secondary border-none">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleExportReport}
              className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
                  </div>
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Income</p>
                <h3 className="font-heading text-3xl font-bold text-green-400">
                  ${totalIncome.toLocaleString()}
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />
                  </div>
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Expenses</p>
                <h3 className="font-heading text-3xl font-bold text-red-400">
                  ${totalExpenses.toLocaleString()}
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </div>
                </div>
                <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Net Savings</p>
                <h3 className="font-heading text-3xl font-bold text-primary">
                  ${netSavings.toLocaleString()}
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
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <PieChart className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Monthly Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Income vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="month" stroke="#94A3B8" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                        labelStyle={{ color: '#E0E7FF' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#4ade80" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="font-paragraph text-secondary-foreground/60">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
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

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="bg-secondary border-none">
            <CardHeader>
              <CardTitle className="font-heading">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#E0E7FF' }}
                  />
                  <Bar dataKey="value" fill="#3567fd" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals Progress */}
        {goalsProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-secondary border-none">
              <CardHeader>
                <CardTitle className="font-heading">Goals Progress Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goalsProgress.map((goal, index) => (
                    <div key={index} className="p-4 bg-background/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading text-base font-semibold">{goal.name}</h4>
                        <span className="font-paragraph text-sm text-secondary-foreground/70">
                          {goal.progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-background/50 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="font-paragraph text-xs text-secondary-foreground/60">
                        ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 sm:mt-8"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="font-heading">Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insightsLoading && (
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="font-paragraph text-sm text-secondary-foreground/80">Generating insights…</p>
                </div>
              )}
              {insightsError && (
                <div className="p-3 bg-secondary/50 rounded-xl">
                  <p className="font-paragraph text-sm text-secondary-foreground/80">{insightsError}</p>
                </div>
              )}
              {(aiInsights.length ? aiInsights : [
                `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for 20%+ by optimizing top categories.`,
                `Average transaction value: ${((totalIncome + totalExpenses) / Math.max(filteredTransactions.length, 1)).toFixed(2)}.`,
                categoryChartData[0] ? `Top category: ${categoryChartData[0].name} ($${categoryChartData[0].value.toLocaleString()}).` : '',
              ].filter(Boolean)).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <p className="font-paragraph text-sm text-secondary-foreground/90">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
