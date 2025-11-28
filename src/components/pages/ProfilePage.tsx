import { motion } from 'framer-motion';
import { User, Calendar, Shield, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-[100rem] mx-auto px-6 lg:px-12 py-8 pt-24">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2">Profile</h1>
          <p className="font-paragraph text-secondary-foreground/70">
            Manage your account information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-secondary border-none">
              <CardContent className="p-8 text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-heading font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>

                <h2 className="font-heading text-2xl font-bold mb-2">
                  {user?.name || user?.email || 'User'}
                </h2>


                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="font-paragraph text-sm text-secondary-foreground/70">
                    Active
                  </span>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-secondary border-none mb-6">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/30 rounded-xl">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">Name</p>
                    <p className="font-heading text-base font-semibold">
                      {user?.name || 'Not provided'}
                    </p>
                  </div>

                  <div className="p-4 bg-background/30 rounded-xl">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">Email</p>
                    <p className="font-heading text-base font-semibold break-all">
                      {user?.email || 'Not provided'}
                    </p>
                </div>

                  <div className="p-4 bg-background/30 rounded-xl">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">User ID</p>
                    <p className="font-heading text-xs font-semibold break-all">
                      {user?.id || 'Not available'}
                        </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary border-none mb-6">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {user?.createdAt && (
                  <div className="p-4 bg-background/30 rounded-xl">
                    <p className="font-paragraph text-xs text-secondary-foreground/60 mb-1">Member Since</p>
                    <p className="font-heading text-base font-semibold">
                        {formatDate(new Date(user.createdAt))}
                    </p>
                  </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-paragraph text-sm text-secondary-foreground/80 mb-4">
                  Your data is encrypted and securely stored. We never share your personal information with third parties without your consent.
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-primary/20 rounded-full">
                    <span className="font-paragraph text-xs text-primary">🔒 Bank-level encryption</span>
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-full">
                    <span className="font-paragraph text-xs text-primary">🛡️ Privacy protected</span>
                  </div>
                  <div className="px-3 py-1 bg-primary/20 rounded-full">
                    <span className="font-paragraph text-xs text-primary">✓ Secure authentication</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

