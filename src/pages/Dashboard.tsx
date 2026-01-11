import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  CalendarCheck, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Home,
  LogOut,
  User,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import OrderHistory from '@/components/OrderHistory';
import MyReviews from '@/components/MyReviews';

interface Booking {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: string | null;
  table_number: number | null;
  special_requests: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadBookings();

      // Real-time updates for booking status changes
      const channel = supabase
        .channel('user-bookings')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'table_bookings', filter: `user_id=eq.${user.id}` }, 
          () => loadBookings()
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('table_bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    
    setBookings(data || []);
    setLoading(false);
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('table_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', user?.id);
    
    if (error) {
      toast.error('Failed to cancel booking');
    } else {
      toast.success('Booking cancelled successfully');
      loadBookings();
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl font-bold">zayka<span className="text-primary">.</span></h1>
            <span className="text-muted-foreground hidden sm:inline">| My Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                Welcome, {profile?.full_name || 'Guest'}!
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">
                {bookings.filter(b => b.status === 'accepted').length}
              </p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-500">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">
                {bookings.filter(b => b.status === 'rejected').length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        <div className="mb-8">
          <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-primary" />
            Upcoming Bookings
          </h3>
          
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming bookings</p>
                <Button 
                  variant="link" 
                  className="mt-2" 
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      document.getElementById('book-a-table')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Book a table now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Status indicator */}
                      <div className={`p-4 md:p-6 flex items-center justify-center md:w-32 ${
                        booking.status === 'accepted' ? 'bg-green-500/10' :
                        booking.status === 'rejected' ? 'bg-destructive/10' :
                        'bg-yellow-500/10'
                      }`}>
                        <div className="text-center">
                          {getStatusIcon(booking.status)}
                          <p className="text-xs font-medium mt-1 capitalize">{booking.status || 'Pending'}</p>
                        </div>
                      </div>
                      
                      {/* Booking details */}
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                              <CalendarCheck className="h-5 w-5 text-primary" />
                              {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                            </div>
                            <div className="flex flex-wrap gap-4 text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {booking.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {booking.guests} Guests
                              </span>
                              {booking.table_number && (
                                <span className="flex items-center gap-1 text-primary font-medium">
                                  <MapPin className="h-4 w-4" />
                                  Table #{booking.table_number}
                                </span>
                              )}
                            </div>
                            {booking.special_requests && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> {booking.special_requests}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            {booking.status === 'pending' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel your booking for {format(new Date(booking.date), 'MMMM d, yyyy')} at {booking.time}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      Yes, Cancel Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Order History & Reviews */}
        <div className="grid lg:grid-cols-2 gap-6">
          <OrderHistory />
          <MyReviews />
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Past Bookings
            </h3>
            <div className="grid gap-3">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(booking.status)}
                        <div>
                          <p className="font-medium">
                            {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.guests} guests
                            {booking.table_number && ` • Table #${booking.table_number}`}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
