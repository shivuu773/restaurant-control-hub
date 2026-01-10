import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  MessageSquare, 
  UtensilsCrossed, 
  Users, 
  LogOut,
  Home,
  Image,
  ChefHat,
  PartyPopper,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: UtensilsCrossed, label: 'Menu', path: '/admin/menu' },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings' },
  { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
  { icon: Users, label: 'Live Chat', path: '/admin/chat' },
  { icon: Image, label: 'Gallery', path: '/admin/gallery' },
  { icon: ChefHat, label: 'Chefs', path: '/admin/chefs' },
  { icon: PartyPopper, label: 'Events', path: '/admin/events' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="admin-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-display text-3xl">zayka<span className="text-primary">.</span></h1>
        <p className="text-sm text-muted-foreground">Admin Panel</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-sidebar-accent'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3" 
          onClick={() => navigate('/')}
        >
          <Home className="h-5 w-5" />
          View Site
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive" 
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
