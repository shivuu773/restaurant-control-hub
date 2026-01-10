import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="font-display text-4xl font-bold">
              zayka<span className="text-primary">.</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <button onClick={() => scrollToSection('hero')} className="nav-link">
              Home
            </button>
            <button onClick={() => scrollToSection('about')} className="nav-link">
              About
            </button>
            <button onClick={() => scrollToSection('menu')} className="nav-link">
              Menu
            </button>
            <button onClick={() => scrollToSection('events')} className="nav-link">
              Events
            </button>
            <button onClick={() => scrollToSection('chefs')} className="nav-link">
              Chefs
            </button>
            <button onClick={() => scrollToSection('gallery')} className="nav-link">
              Gallery
            </button>
            <button onClick={() => scrollToSection('contact')} className="nav-link">
              Contact
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="hidden sm:inline font-medium">
                      {profile?.full_name || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Bookings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="text-primary">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Login
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/auth')}>
                    <User className="mr-2 h-4 w-4" />
                    Customer Login
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/auth?type=admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Login
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              onClick={() => scrollToSection('book-a-table')}
              className="btn-book hidden sm:flex"
            >
              Book a Table
            </Button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('hero')} className="nav-link text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('about')} className="nav-link text-left">
                About
              </button>
              <button onClick={() => scrollToSection('menu')} className="nav-link text-left">
                Menu
              </button>
              <button onClick={() => scrollToSection('events')} className="nav-link text-left">
                Events
              </button>
              <button onClick={() => scrollToSection('chefs')} className="nav-link text-left">
                Chefs
              </button>
              <button onClick={() => scrollToSection('gallery')} className="nav-link text-left">
                Gallery
              </button>
              <button onClick={() => scrollToSection('contact')} className="nav-link text-left">
                Contact
              </button>
              {user ? (
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="outline"
                    onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Bookings
                  </Button>
                  {isAdmin && (
                    <Button 
                      variant="outline"
                      onClick={() => { navigate('/admin'); setIsMobileMenuOpen(false); }}
                      className="w-full justify-start text-primary"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button 
                    variant="outline"
                    onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Customer Login
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => { navigate('/auth?type=admin'); setIsMobileMenuOpen(false); }}
                    className="w-full justify-start"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Login
                  </Button>
                </div>
              )}
              <Button onClick={() => scrollToSection('book-a-table')} className="btn-book">
                Book a Table
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
