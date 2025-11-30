import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, DollarSign, TrendingUp, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BaseCrudService } from '@/integrations';
import { FinancialGoals } from '@/entities';
import Header from '@/components/Header';

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoals[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoals | null>(null);
  const [updateAmount, setUpdateAmount] = useState('');

  const [formData, setFormData] = useState({
    goalName: '',
    targetAmount: '',
    currentProgress: '0',
    deadline: '',
    goalDescription: '',
    priorityLevel: 'medium'
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    const { items } = await BaseCrudService.getAll<FinancialGoals>('financialgoals');
    setGoals(items);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: FinancialGoals = {
      _id: crypto.randomUUID(),
      goalName: formData.goalName,
      targetAmount: parseFloat(formData.targetAmount),
      currentProgress: parseFloat(formData.currentProgress),
      deadline: formData.deadline,
      goalDescription: formData.goalDescription,
      priorityLevel: formData.priorityLevel,
      isAchieved: false
    };

    await BaseCrudService.create('financialgoals', newGoal);
    await loadGoals();
    setIsAddDialogOpen(false);
    setFormData({
      goalName: '',
      targetAmount: '',
      currentProgress: '0',
      deadline: '',
      goalDescription: '',
      priorityLevel: 'medium'
    });
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    const newProgress = (selectedGoal.currentProgress || 0) + parseFloat(updateAmount);
    const isAchieved = newProgress >= (selectedGoal.targetAmount || 0);

    await BaseCrudService.update('financialgoals', {
      ...selectedGoal,
      currentProgress: newProgress,
      isAchieved
    });

    await loadGoals();
    setIsUpdateDialogOpen(false);
    setSelectedGoal(null);
    setUpdateAmount('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await BaseCrudService.delete('financialgoals', id);
      await loadGoals();
    }
  };

  const activeGoals = goals.filter(g => !g.isAchieved);
  const achievedGoals = goals.filter(g => g.isAchieved);
  const totalTargetAmount = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalProgress = goals.reduce((sum, g) => sum + (g.currentProgress || 0), 0);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-primary/20 text-primary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-paragraph text-secondary-foreground/70">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 pt-28 pb-24">
        <div className="flex items-center justify-between mb-8 mt-6">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Financial Goals</h1>
            <p className="font-paragraph text-secondary-foreground/70">
              Set and track your financial objectives
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-secondary border-none max-w-md z-[60]">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="goalName" className="font-paragraph text-sm mb-2 block">Goal Name</Label>
                  <Input
                    id="goalName"
                    required
                    value={formData.goalName}
                    onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
                    className="bg-background border-none"
                    placeholder="e.g., Emergency Fund"
                  />
                </div>

                <div>
                  <Label htmlFor="targetAmount" className="font-paragraph text-sm mb-2 block">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="bg-background border-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="currentProgress" className="font-paragraph text-sm mb-2 block">Current Progress</Label>
                  <Input
                    id="currentProgress"
                    type="number"
                    step="0.01"
                    value={formData.currentProgress}
                    onChange={(e) => setFormData({ ...formData, currentProgress: e.target.value })}
                    className="bg-background border-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="deadline" className="font-paragraph text-sm mb-2 block">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="bg-background border-none"
                  />
                </div>

                <div>
                  <Label htmlFor="priorityLevel" className="font-paragraph text-sm mb-2 block">Priority Level</Label>
                  <Select value={formData.priorityLevel} onValueChange={(value) => setFormData({ ...formData, priorityLevel: value })}>
                    <SelectTrigger className="bg-background border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary border-none">
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goalDescription" className="font-paragraph text-sm mb-2 block">Description</Label>
                  <Input
                    id="goalDescription"
                    value={formData.goalDescription}
                    onChange={(e) => setFormData({ ...formData, goalDescription: e.target.value })}
                    className="bg-background border-none"
                    placeholder="Brief description of your goal"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Create Goal
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
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Active Goals</p>
              <h3 className="font-heading text-3xl font-bold">{activeGoals.length}</h3>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Achieved Goals</p>
              <h3 className="font-heading text-3xl font-bold text-green-400">{achievedGoals.length}</h3>
            </CardContent>
          </Card>

          <Card className="bg-secondary border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60 mb-1">Total Progress</p>
              <h3 className="font-heading text-3xl font-bold text-primary">
                ${totalProgress.toLocaleString()}
              </h3>
              <p className="font-paragraph text-xs text-secondary-foreground/60 mt-1">
                of ${totalTargetAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold mb-4">Active Goals</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const progress = ((goal.currentProgress || 0) / (goal.targetAmount || 1)) * 100;
                const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                
                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-secondary border-none">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-heading text-xl font-bold">{goal.goalName}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(goal.priorityLevel)}`}>
                                {goal.priorityLevel}
                              </span>
                            </div>
                            {goal.goalDescription && (
                              <p className="font-paragraph text-sm text-secondary-foreground/70 mb-3">
                                {goal.goalDescription}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-paragraph text-sm text-secondary-foreground/70">Progress</span>
                            <span className="font-heading text-sm font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="mb-2" />
                          <div className="flex items-center justify-between">
                            <span className="font-paragraph text-xs text-secondary-foreground/60">
                              ${goal.currentProgress?.toLocaleString()} / ${goal.targetAmount?.toLocaleString()}
                            </span>
                            <span className="font-paragraph text-xs text-secondary-foreground/60">
                              ${((goal.targetAmount || 0) - (goal.currentProgress || 0)).toLocaleString()} left
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 p-3 bg-background/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-secondary-foreground/60" />
                            <span className="font-paragraph text-sm text-secondary-foreground/70">
                              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
                            </span>
                          </div>
                          {daysLeft > 0 && (
                            <span className="font-paragraph text-xs text-primary">
                              {daysLeft} days left
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setSelectedGoal(goal);
                              setIsUpdateDialogOpen(true);
                            }}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Update Progress
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDelete(goal._id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Achieved Goals */}
        {achievedGoals.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-green-400" />
              Achieved Goals
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {achievedGoals.map((goal) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-heading text-xl font-bold">{goal.goalName}</h3>
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                              Completed
                            </span>
                          </div>
                          {goal.goalDescription && (
                            <p className="font-paragraph text-sm text-secondary-foreground/70 mb-3">
                              {goal.goalDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <Progress value={100} className="mb-2" />
                        <div className="flex items-center justify-between">
                          <span className="font-paragraph text-sm text-green-400 font-semibold">
                            ${goal.targetAmount?.toLocaleString()} achieved!
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(goal._id)}
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <Card className="bg-secondary border-none">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-secondary-foreground/40 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">No goals yet</h3>
              <p className="font-paragraph text-secondary-foreground/70 mb-6">
                Start setting financial goals to track your progress
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Update Progress Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="bg-secondary border-none max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-2xl">Update Progress</DialogTitle>
            </DialogHeader>
            {selectedGoal && (
              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div className="bg-background/30 rounded-xl p-4">
                  <h3 className="font-heading text-lg font-semibold mb-2">{selectedGoal.goalName}</h3>
                  <p className="font-paragraph text-sm text-secondary-foreground/70">
                    Current: ${selectedGoal.currentProgress?.toLocaleString()} / ${selectedGoal.targetAmount?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label htmlFor="updateAmount" className="font-paragraph text-sm mb-2 block">
                    Add Amount
                  </Label>
                  <Input
                    id="updateAmount"
                    type="number"
                    step="0.01"
                    required
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(e.target.value)}
                    className="bg-background border-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <p className="font-paragraph text-sm text-secondary-foreground/70 mb-1">New Progress</p>
                  <p className="font-heading text-2xl font-bold text-primary">
                    ${((selectedGoal.currentProgress || 0) + parseFloat(updateAmount || '0')).toLocaleString()}
                  </p>
                </div>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Progress
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
