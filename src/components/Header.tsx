import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="font-medium">
                    {profile?.full_name || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-bookings')}>
                    My Bookings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="hidden sm:flex"
              >
                Login
              </Button>
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
              {!user && (
                <Button onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }}>
                  Login
                </Button>
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
