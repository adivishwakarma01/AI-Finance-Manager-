import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { BaseCrudService } from '@/integrations';
import { Transactions } from '@/entities';

export default function FAQPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string>('');
  const [asking, setAsking] = useState(false);
  const [transactions, setTransactions] = useState<Transactions[]>([]);

  // Load transactions to provide context for tailored AI advice
  useEffect(() => {
    (async () => {
      try {
        const tx = await BaseCrudService.getAll<Transactions>('transactions');
        setTransactions(tx.items || []);
      } catch (err) {
        console.error('Failed to load transactions for advisor context', err);
        setTransactions([]);
      }
    })();
  }, []);

  const buildSummary = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Number((((income - expenses) / income) * 100).toFixed(2)) : 0;
    const topCategories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: Record<string, number>, t) => {
        const cat = t.category || 'Other';
        acc[cat] = (acc[cat] || 0) + (t.amount || 0);
        return acc;
      }, {})
    ;
    const topFive = Object.entries(topCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 5)
      .map(t => ({ date: t.date, type: t.type, category: t.category, amount: t.amount, description: t.description }));

    return { totalIncome: income, totalExpenses: expenses, balance, savingsRate, topCategories: topFive, recentTransactions };
  };

  const askAdvisor = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setAnswer('');
    try {
      const summary = buildSummary();
      const apiBase = import.meta.env.VITE_API_URL as string | undefined;
      const derivedAdvisor = apiBase ? apiBase.replace(/\/api$/, '') : undefined;
      const ADVISOR_URL = import.meta.env.VITE_ADVISOR_URL || derivedAdvisor || 'http://localhost:8787';
      const response = await fetch(`${ADVISOR_URL}/api/advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: { summary } })
      });
      if (!response.ok) {
        // Graceful fallback text
        setAnswer('Here’s a practical approach: Automate a small savings transfer after payday, cap discretionary categories, and review subscriptions to reduce recurring costs.');
        return;
      }
      const data = await response.json();
      setAnswer(data?.answer || 'Sorry, I could not generate an answer at this time.');
    } catch (err) {
      console.error('Advisor Q&A error', err);
      setAnswer('Here’s a practical approach: Automate a small savings transfer after payday, cap discretionary categories, and review subscriptions to reduce recurring costs.');
    } finally {
      setAsking(false);
    }
  };

  const sampleQuestions = [
    'How can I start saving more each month?',
    'What’s a good beginner budget plan?',
    'How do I reduce spending in my top categories?',
    'Should I invest or build an emergency fund first?'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[100rem] mx-auto px-6 lg:px-12 py-8 pt-24">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">AI Financial Advisor</h1>
          <p className="font-paragraph text-secondary-foreground/70">
            Ask any personal finance question in simple language. No API key needed on the frontend.
          </p>
        </div>

        {/* Advisor Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold mb-2">Ask the AI Advisor</h3>
                  <p className="font-paragraph text-sm text-secondary-foreground/80 mb-4">
                    Powered by a secure server-side AI provider with local fallbacks for reliability.
                  </p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Type your finance question..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="bg-background border-none flex-1"
                      />
                      <Button onClick={askAdvisor} disabled={asking} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        {asking ? 'Thinking…' : 'Ask AI'}
                      </Button>
                    </div>
                    {answer && (
                      <div className="mt-2 p-4 bg-secondary/50 rounded-xl">
                        <p className="font-paragraph text-sm text-secondary-foreground/90 whitespace-pre-wrap">{answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sample Questions */}
        <Card className="bg-secondary border-none">
          <CardHeader>
            <CardTitle className="font-heading">Try asking:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {/* Buttons wrap on small screens */}
              {sampleQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="border-buttonoutline text-buttonoutline hover:bg-buttonoutline/10"
                  onClick={() => setQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
