import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowLeft, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MFAVerification from '@/components/auth/MFAVerification';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get('type') === 'admin';
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showMFAVerification, setShowMFAVerification] = useState(false);
  const { signIn, signUp, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check MFA status on auth state change
  useEffect(() => {
    const checkMFAStatus = async () => {
      if (user && isAdminMode) {
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (!error && data) {
          // If user has MFA enabled but hasn't verified yet (aal1 but needs aal2)
          if (data.currentLevel === 'aal1' && data.nextLevel === 'aal2') {
            setShowMFAVerification(true);
            return;
          }
          
          // If already at aal2 or no MFA required, proceed
          if (isAdmin) {
            navigate('/admin');
          }
        }
      } else if (user && !isAdminMode) {
        navigate('/');
      }
    };
    
    checkMFAStatus();
  }, [user, isAdmin, isAdminMode, navigate]);

  const handleMFASuccess = () => {
    setShowMFAVerification(false);
    navigate('/admin');
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setShowMFAVerification(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
      setIsGoogleLoading(false);
    }
  };

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

  // Show MFA verification screen
  if (showMFAVerification) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
            <MFAVerification
              onSuccess={handleMFASuccess}
              onCancel={handleMFACancel}
            />
          </div>
        </div>
      </div>
    );
  }

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
              isAdminMode ? 'bg-primary' : 'bg-primary/20'
            }`}>
              {isAdminMode ? (
                <Shield className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Leaf className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="font-display text-4xl mb-2">
              zayka<span className="text-primary">.</span>
            </h1>
            <h2 className="font-heading text-xl text-muted-foreground">
              {isAdminMode ? 'Admin Portal' : 'Pure Veg Restaurant'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Social Login - Only for Customer Portal */}
          {!isAdminMode && (
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-12 border-border hover:bg-secondary"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-4 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            </div>
          )}

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
