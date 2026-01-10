import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, MessageSquare, UtensilsCrossed, TrendingUp, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  todayBookings: number;
  totalMessages: number;
  unreadMessages: number;
  menuItems: number;
}

interface RecentBooking {
  id: string;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    totalMessages: 0,
    unreadMessages: 0,
    menuItems: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: totalBookings },
        { count: pendingBookings },
        { count: todayBookings },
        { count: totalMessages },
        { count: unreadMessages },
        { count: menuItems },
        { data: recent },
      ] = await Promise.all([
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('date', today),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('table_bookings').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalBookings: totalBookings || 0,
        pendingBookings: pendingBookings || 0,
        todayBookings: todayBookings || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        menuItems: menuItems || 0,
      });
      setRecentBookings(recent || []);
      setLoading(false);
    };

    loadData();
  }, []);

  const statCards = [
    { 
      label: 'Total Bookings', 
      value: stats.totalBookings, 
      icon: CalendarCheck, 
      color: 'bg-primary',
      subtitle: `${stats.todayBookings} today`
    },
    { 
      label: 'Pending Bookings', 
      value: stats.pendingBookings, 
      icon: Clock, 
      color: 'bg-yellow-500',
      subtitle: 'Awaiting response'
    },
    { 
      label: 'Messages', 
      value: stats.totalMessages, 
      icon: MessageSquare, 
      color: 'bg-blue-500',
      subtitle: `${stats.unreadMessages} unread`
    },
    { 
      label: 'Menu Items', 
      value: stats.menuItems, 
      icon: UtensilsCrossed, 
      color: 'bg-green-500',
      subtitle: 'Active items'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground text-sm">
                  <th className="pb-3">Guest</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Party Size</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-3 font-medium">{booking.name}</td>
                    <td className="py-3 text-muted-foreground">{booking.date}</td>
                    <td className="py-3 text-muted-foreground">{booking.time}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {booking.guests}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge 
                        variant={
                          booking.status === 'accepted' ? 'default' : 
                          booking.status === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
