import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BaseCrudService } from '@/integrations';
import { Transactions } from '@/entities';
import Header from '@/components/Header';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transactions[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transactions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    isRecurring: false,
    notes: ''
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const loadTransactions = async () => {
    setLoading(true);
    const { items } = await BaseCrudService.getAll<Transactions>('transactions');
    setTransactions(items);
    setLoading(false);
  };

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    filtered.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterType, filterCategory]);

  const categories = Array.from(new Set(transactions.map(t => t.category).filter(Boolean)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction: Transactions = {
      _id: crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      date: formData.date,
      category: formData.category,
      description: formData.description,
      isRecurring: formData.isRecurring,
      notes: formData.notes
    };

    await BaseCrudService.create('transactions', newTransaction);
    await loadTransactions();
    setIsAddDialogOpen(false);
    setFormData({
      amount: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      isRecurring: false,
      notes: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await BaseCrudService.delete('transactions', id);
      await loadTransactions();
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-secondary-foreground/70">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-6 lg:px-12 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Transactions</h1>
            <p className="font-paragraph text-secondary-foreground/70">
              Track and manage your income and expenses
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-secondary border-none max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Add New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="font-paragraph text-sm mb-2 block">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-background border-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="font-paragraph text-sm mb-2 block">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-background border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-none">
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="font-paragraph text-sm mb-2 block">Category</Label>
                  <Input
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-background border-none"
                    placeholder="e.g., Food, Salary, Entertainment"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-paragraph text-sm mb-2 block">Description</Label>
                  <Input
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-background border-none"
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="font-paragraph text-sm mb-2 block">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-background border-none"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="font-paragraph text-sm mb-2 block">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-background border-none"
                    placeholder="Additional notes"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isRecurring" className="font-paragraph text-sm">Recurring transaction</Label>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-secondary border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Income</p>
              <h3 className="font-heading text-3xl font-bold text-green-400">
                ${totalIncome.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Expenses</p>
              <h3 className="font-heading text-3xl font-bold text-red-400">
                ${totalExpenses.toLocaleString()}
              </h3>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Net Balance</p>
              <h3 className="font-heading text-3xl font-bold text-primary">
                ${(totalIncome - totalExpenses).toLocaleString()}
              </h3>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-secondary border-none mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="font-paragraph text-sm mb-2 block">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-foreground/40" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-background border-none pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="font-paragraph text-sm mb-2 block">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-background border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-none">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-paragraph text-sm mb-2 block">Category</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-background border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-secondary border-none">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category || ''}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-secondary border-none">
          <CardHeader>
            <CardTitle className="font-heading">All Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-background/30 rounded-xl hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center flex-shrink-0`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-6 h-6 text-green-400" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-base font-semibold truncate">{transaction.description}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-paragraph text-xs text-secondary-foreground/60">{transaction.category}</span>
                          <span className="font-paragraph text-xs text-secondary-foreground/60">
                            {new Date(transaction.date || '').toLocaleDateString()}
                          </span>
                          {transaction.isRecurring && (
                            <span className="font-paragraph text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Recurring</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-heading text-lg font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="font-paragraph text-secondary-foreground/60">No transactions found</p>
                  <p className="font-paragraph text-sm text-secondary-foreground/40 mt-2">
                    Add your first transaction to get started
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
