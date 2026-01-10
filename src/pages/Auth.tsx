import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('type') === 'admin';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isAdminMode && isAdmin) {
        navigate('/admin');
      } else if (!isAdminMode) {
        navigate('/');
      }
    }
  }, [user, isAdmin, isAdminMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        toast({ 
          title: 'Welcome back!', 
          description: 'Successfully logged in.' 
        });
        
        // Navigation handled by useEffect
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        
        toast({ 
          title: 'Account created!', 
          description: 'You can now login with your credentials.' 
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              isAdminMode ? 'bg-primary' : 'bg-secondary'
            }`}>
              {isAdminMode ? (
                <Shield className="h-8 w-8 text-primary-foreground" />
              ) : (
                <User className="h-8 w-8 text-foreground" />
              )}
            </div>
            <h1 className="font-display text-4xl mb-2">
              zayka<span className="text-primary">.</span>
            </h1>
            <h2 className="font-heading text-xl text-muted-foreground">
              {isAdminMode ? 'Admin Portal' : 'Customer Portal'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Full Name" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="pl-10"
                  required 
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="pl-10"
                required 
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="pl-10"
                required 
              />
            </div>
            
            <Button 
              type="submit" 
              className={`w-full ${isAdminMode ? 'bg-primary hover:bg-primary/90' : 'btn-book'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Toggle */}
          {!isAdminMode && (
            <p className="text-center mt-6 text-muted-foreground">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          )}

          {/* Switch Portal */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isAdminMode ? 'Not an admin?' : 'Are you a staff member?'}
            </p>
            <button
              onClick={() => navigate(isAdminMode ? '/auth' : '/auth?type=admin')}
              className="text-sm text-primary hover:underline font-medium flex items-center gap-2 mx-auto"
            >
              {isAdminMode ? (
                <>
                  <User className="h-4 w-4" />
                  Go to Customer Login
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Go to Admin Login
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
