import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminMenu from '@/components/admin/AdminMenu';
import AdminBookings from '@/components/admin/AdminBookings';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminChat from '@/components/admin/AdminChat';
import AdminGallery from '@/components/admin/AdminGallery';
import AdminChefs from '@/components/admin/AdminChefs';
import AdminEvents from '@/components/admin/AdminEvents';
import AdminSettings from '@/components/admin/AdminSettings';

const Admin = () => {
  const { user, isAdmin, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => setNotifications(data || []));

      const channel = supabase
        .channel('admin-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => 
          setNotifications((prev) => [payload.new as any, ...prev])
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="admin-content">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-heading text-2xl">Welcome back, {profile?.full_name || 'Admin'}</h2>
            <p className="text-muted-foreground">Manage your restaurant from here.</p>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-6 w-6" />
            {notifications.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">{notifications.length}</Badge>
            )}
          </button>
        </div>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/chat" element={<AdminChat />} />
          <Route path="/gallery" element={<AdminGallery />} />
          <Route path="/chefs" element={<AdminChefs />} />
          <Route path="/events" element={<AdminEvents />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
