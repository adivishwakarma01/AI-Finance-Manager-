import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Target, PieChart, Brain, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-secondary">
        <div className="max-w-[120rem] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">FinanceAI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm hover:text-primary transition-colors">Features</a>
              <a href="#insights" className="text-sm hover:text-primary transition-colors">AI Insights</a>
              <a href="#investments" className="text-sm hover:text-primary transition-colors">Investments</a>
              <Link to="/faq" className="text-sm hover:text-primary transition-colors">FAQ</Link>
            </div>
            
            <Link to="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Bleed */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-[#1a2744] to-background"></div>
        
        {/* 3D Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-32 left-12 w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-sm transform rotate-12"
          style={{ boxShadow: '0 20px 60px rgba(53, 103, 253, 0.3)' }}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute top-48 right-16 w-56 h-56 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm transform -rotate-12"
          style={{ boxShadow: '0 20px 60px rgba(53, 103, 253, 0.2)' }}
        ></motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute bottom-32 left-24 w-40 h-40 rounded-full bg-gradient-to-br from-primary/25 to-transparent backdrop-blur-sm"
          style={{ boxShadow: '0 20px 60px rgba(53, 103, 253, 0.25)' }}
        ></motion.div>

        <div className="relative z-10 max-w-[120rem] mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="font-heading text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Master Your Finances with AI Intelligence
              </h1>
              <p className="font-paragraph text-lg lg:text-xl text-secondary-foreground/80 mb-8 max-w-2xl">
                Track expenses, achieve goals, and grow wealth with personalized AI insights and smart investment recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link to="/signup">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-6">
                    Start Free Today
                  </Button>
                </Link>
                <Link to="/investments">
                  <Button size="lg" variant="outline" className="border-buttonoutline text-buttonoutline hover:bg-buttonoutline/10 text-base px-8 py-6">
                    Explore Investments
                  </Button>
                </Link>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="font-paragraph text-base">AI-Powered Financial Insights</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="font-paragraph text-base">Smart Goal Tracking</span>
                </div>
                <div className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="font-paragraph text-base">Beginner-Friendly Investments</span>
                </div>
              </div>
            </motion.div>

            {/* Right - App Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Phone Frame */}
                <div className="bg-gradient-to-br from-secondary to-background rounded-3xl p-4 shadow-2xl" style={{ boxShadow: '0 30px 80px rgba(53, 103, 253, 0.4)' }}>
                  <div className="bg-background rounded-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-secondary/50 px-6 py-3 flex items-center justify-between">
                      <span className="text-xs">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full bg-primary/30"></div>
                        <div className="w-4 h-4 rounded-full bg-primary/30"></div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-6 space-y-6">
                      <div className="text-center">
                        <p className="text-xs text-secondary-foreground/60 mb-2">Total Balance</p>
                        <h2 className="font-heading text-4xl font-bold text-primary">$657,000</h2>
                      </div>
                      
                      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                        <p className="text-xs text-secondary-foreground/60 mb-1">Monthly Savings</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-heading text-2xl font-bold">25,388$</span>
                          <span className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">+4%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-secondary/50 rounded-xl p-3">
                          <TrendingUp className="w-5 h-5 text-primary mb-2" />
                          <p className="text-xs text-secondary-foreground/60">Income</p>
                          <p className="font-heading text-sm font-semibold">$8,450</p>
                        </div>
                        <div className="bg-secondary/50 rounded-xl p-3">
                          <PieChart className="w-5 h-5 text-iconcolor mb-2" />
                          <p className="text-xs text-secondary-foreground/60">Expenses</p>
                          <p className="font-heading text-sm font-semibold">$3,062</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground/70 max-w-3xl mx-auto">
              Powerful tools designed to help you take control of your financial future
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Insights',
                description: 'Get personalized financial advice and spending analysis powered by advanced AI algorithms.'
              },
              {
                icon: TrendingUp,
                title: 'Smart Expense Tracking',
                description: 'Automatically categorize transactions and track spending patterns with intelligent automation.'
              },
              {
                icon: Target,
                title: 'Goal Management',
                description: 'Set financial goals and monitor progress with visual tracking and milestone celebrations.'
              },
              {
                icon: PieChart,
                title: 'Investment Suggestions',
                description: 'Receive beginner-friendly investment recommendations tailored to your risk profile.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Bank-level encryption ensures your financial data stays safe and confidential.'
              },
              {
                icon: Zap,
                title: 'Real-Time Alerts',
                description: 'Stay informed with instant notifications about important financial events and opportunities.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary rounded-2xl p-8 hover:bg-secondary/80 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="font-paragraph text-secondary-foreground/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Insights Section */}
      <section id="insights" className="py-24">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-6">
                Financial Intelligence at Your Fingertips
              </h2>
              <p className="font-paragraph text-lg text-secondary-foreground/70 mb-8">
                Our AI analyzes your spending habits, income patterns, and financial goals to provide actionable insights that help you make smarter money decisions.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Spending Analysis</h4>
                    <p className="font-paragraph text-sm text-secondary-foreground/70">Understand where your money goes with detailed breakdowns</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Savings Recommendations</h4>
                    <p className="font-paragraph text-sm text-secondary-foreground/70">Get personalized tips to maximize your savings potential</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Budget Optimization</h4>
                    <p className="font-paragraph text-sm text-secondary-foreground/70">AI-powered suggestions to optimize your monthly budget</p>
                  </div>
                </li>
              </ul>
              <Link to="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Try AI Insights
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-secondary rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8 text-primary" />
                  <h3 className="font-heading text-xl font-semibold">AI Financial Advisor</h3>
                </div>
                
                <div className="bg-background/50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-paragraph text-sm text-secondary-foreground/90">
                        Based on your spending patterns, you could save an additional $450/month by reducing dining out expenses by 30%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="font-paragraph text-xs text-secondary-foreground/70 mb-2">Potential Annual Savings</p>
                    <p className="font-heading text-2xl font-bold text-primary">$5,400</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/30 rounded-xl p-4">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">This Month</p>
                    <p className="font-heading text-lg font-semibold">-12% spending</p>
                  </div>
                  <div className="bg-background/30 rounded-xl p-4">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">Goal Progress</p>
                    <p className="font-heading text-lg font-semibold text-primary">+23%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Investments Section */}
      <section id="investments" className="py-24 bg-secondary/30">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-4">
              Start Investing with Confidence
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground/70 max-w-3xl mx-auto">
              Beginner-friendly investment suggestions tailored to your financial goals and risk tolerance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { label: 'Low Risk', value: '4-6% Returns', color: 'bg-green-500/20 text-green-400' },
              { label: 'Medium Risk', value: '8-12% Returns', color: 'bg-yellow-500/20 text-yellow-400' },
              { label: 'High Risk', value: '15%+ Returns', color: 'bg-red-500/20 text-red-400' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary rounded-2xl p-6 text-center"
              >
                <div className={`inline-block px-4 py-2 rounded-full ${item.color} mb-4`}>
                  <span className="font-heading text-sm font-semibold">{item.label}</span>
                </div>
                <p className="font-heading text-2xl font-bold">{item.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/investments">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore Investment Options
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-12 lg:p-16 text-center border border-primary/20"
          >
            <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Finances?
            </h2>
            <p className="font-paragraph text-lg text-secondary-foreground/70 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving their financial goals with FinanceAI
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-10 py-6">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 py-12 border-t border-secondary">
        <div className="max-w-[100rem] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-heading text-xl font-bold">FinanceAI</span>
              </div>
              <p className="font-paragraph text-sm text-secondary-foreground/60">
                Your intelligent financial companion for a brighter future.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Dashboard</Link></li>
                <li><Link to="/transactions" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Transactions</Link></li>
                <li><Link to="/goals" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Goals</Link></li>
                <li><Link to="/investments" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Investments</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/reports" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Reports</Link></li>
                <li><Link to="/faq" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li><Link to="/profile" className="font-paragraph text-sm text-secondary-foreground/70 hover:text-primary">Profile</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary pt-8 text-center">
            <p className="font-paragraph text-sm text-secondary-foreground/60">
              © 2025 FinanceAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
