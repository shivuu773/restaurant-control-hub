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
      // Load initial notifications
      supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => setNotifications(data || []));

      // Real-time subscription for new notifications
      const channel = supabase
        .channel('admin-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => setNotifications((prev) => [payload.new as any, ...prev])
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <main className="admin-content">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-heading text-2xl">
              Welcome back, {profile?.full_name || 'Admin'}
            </h2>
            <p className="text-muted-foreground">
              Here's what's happening with your restaurant today.
            </p>
          </div>
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                  {notifications.length}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/messages" element={<AdminMessages />} />
          <Route path="/chat" element={<AdminChat />} />
        </Routes>
      </main>
    </div>
  );
};

export default Admin;
