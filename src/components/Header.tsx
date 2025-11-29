import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Menu, X, DollarSign, Target, Brain, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/reports', label: 'Dashboard' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/goals', label: 'Goals' },
    { path: '/investments', label: 'Investments' },
    { path: '/faq', label: 'FAQ' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-secondary">
      <div className="max-w-[100rem] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">FinanceAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-paragraph text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary font-semibold'
                    : 'text-secondary-foreground/70 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" className="text-secondary-foreground/70 hover:text-primary">
                    {user?.name || user?.email || 'Profile'}
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-buttonoutline text-buttonoutline hover:bg-buttonoutline/10"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign In
              </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-secondary pt-4">
            <nav className="flex flex-col gap-4 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-paragraph text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'text-primary font-semibold'
                      : 'text-secondary-foreground/70'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-secondary-foreground/70 hover:text-primary">
                      {user?.name || user?.email || 'Profile'}
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-buttonoutline text-buttonoutline hover:bg-buttonoutline/10"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign In
                </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {!mobileMenuOpen && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-secondary z-50">
          <div className="max-w-[100rem] mx-auto px-6 py-2">
            <div className="flex items-center justify-between">
              <Link to="/reports" className={`flex flex-col items-center gap-1 ${location.pathname === '/reports' ? 'text-primary' : 'text-secondary-foreground/70'}`}>
                <PieChart className="w-6 h-6" />
                <span className="text-[10px]">Dashboard</span>
              </Link>
              <Link to="/transactions" className={`flex flex-col items-center gap-1 ${location.pathname === '/transactions' ? 'text-primary' : 'text-secondary-foreground/70'}`}>
                <DollarSign className="w-6 h-6" />
                <span className="text-[10px]">Transactions</span>
              </Link>
              <Link to="/goals" className={`flex flex-col items-center gap-1 ${location.pathname === '/goals' ? 'text-primary' : 'text-secondary-foreground/70'}`}>
                <Target className="w-6 h-6" />
                <span className="text-[10px]">Goals</span>
              </Link>
              <Link to="/investments" className={`flex flex-col items-center gap-1 ${location.pathname === '/investments' ? 'text-primary' : 'text-secondary-foreground/70'}`}>
                <TrendingUp className="w-6 h-6" />
                <span className="text-[10px]">Invest</span>
              </Link>
              <Link to="/faq" className={`flex flex-col items-center gap-1 ${location.pathname === '/faq' ? 'text-primary' : 'text-secondary-foreground/70'}`}>
                <Brain className="w-6 h-6" />
                <span className="text-[10px]">Advisor</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
