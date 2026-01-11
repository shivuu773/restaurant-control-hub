import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, MessageSquare, UtensilsCrossed, Clock, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  todayBookings: number;
  totalMessages: number;
  unreadMessages: number;
  menuItems: number;
  acceptedBookings: number;
  totalGuests: number;
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

interface BookingTrend {
  date: string;
  bookings: number;
  guests: number;
}

interface PeakHour {
  hour: string;
  bookings: number;
}

interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))', '#22c55e'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    todayBookings: 0,
    totalMessages: 0,
    unreadMessages: 0,
    menuItems: 0,
    acceptedBookings: 0,
    totalGuests: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [bookingTrends, setBookingTrends] = useState<BookingTrend[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const last30Days = subDays(new Date(), 30).toISOString().split('T')[0];
      
      const [
        { count: totalBookings },
        { count: pendingBookings },
        { count: todayBookings },
        { count: totalMessages },
        { count: unreadMessages },
        { count: menuItems },
        { count: acceptedBookings },
        { data: recent },
        { data: allBookings },
      ] = await Promise.all([
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('date', today),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('table_bookings').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('table_bookings').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('table_bookings').select('date, time, guests, status').gte('date', last30Days),
      ]);

      // Calculate total guests
      const totalGuests = allBookings?.reduce((sum, b) => sum + (b.guests || 0), 0) || 0;

      setStats({
        totalBookings: totalBookings || 0,
        pendingBookings: pendingBookings || 0,
        todayBookings: todayBookings || 0,
        totalMessages: totalMessages || 0,
        unreadMessages: unreadMessages || 0,
        menuItems: menuItems || 0,
        acceptedBookings: acceptedBookings || 0,
        totalGuests,
      });
      setRecentBookings(recent || []);

      // Process booking trends (last 7 days)
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date(),
      });

      const trendsData = last7Days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayBookings = allBookings?.filter(b => b.date === dateStr) || [];
        return {
          date: format(day, 'EEE'),
          bookings: dayBookings.length,
          guests: dayBookings.reduce((sum, b) => sum + (b.guests || 0), 0),
        };
      });
      setBookingTrends(trendsData);

      // Process peak hours
      const hourCounts: Record<string, number> = {};
      allBookings?.forEach(booking => {
        if (booking.time) {
          const hour = booking.time.split(':')[0] + ':00';
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      const peakHoursData = Object.entries(hourCounts)
        .map(([hour, bookings]) => ({ hour, bookings }))
        .sort((a, b) => a.hour.localeCompare(b.hour));
      setPeakHours(peakHoursData);

      // Process status distribution
      const statusCounts: Record<string, number> = {
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      };
      allBookings?.forEach(booking => {
        const status = booking.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      setStatusDistribution([
        { name: 'Pending', value: statusCounts.pending, color: '#eab308' },
        { name: 'Accepted', value: statusCounts.accepted, color: '#22c55e' },
        { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' },
        { name: 'Cancelled', value: statusCounts.cancelled, color: '#6b7280' },
      ].filter(s => s.value > 0));

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
      label: 'Total Guests', 
      value: stats.totalGuests, 
      icon: Users, 
      color: 'bg-green-500',
      subtitle: `${stats.acceptedBookings} confirmed`
    },
    { 
      label: 'Messages', 
      value: stats.totalMessages, 
      icon: MessageSquare, 
      color: 'bg-blue-500',
      subtitle: `${stats.unreadMessages} unread`
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trends Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Booking Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {bookingTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingTrends}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBookings)"
                      name="Bookings"
                    />
                    <Line
                      type="monotone"
                      dataKey="guests"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      name="Guests"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No booking data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Peak Booking Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {peakHours.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No booking time data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution & Recent Bookings */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Booking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No status data available
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusDistribution.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {status.name} ({status.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-card border-border lg:col-span-2">
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
    </div>
  );
};

export default AdminDashboard;
