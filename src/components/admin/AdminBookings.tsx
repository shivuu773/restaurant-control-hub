import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, Check, X, Clock, Users, Phone, Mail, MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  special_requests: string | null;
  status: string;
  table_number: number | null;
  created_at: string;
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [bookingToAccept, setBookingToAccept] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();

    // Real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_bookings' },
        () => loadBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBookings = async () => {
    const { data } = await supabase
      .from('table_bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    setBookings(data || []);
    setLoading(false);
  };

  const openAcceptDialog = (booking: Booking) => {
    setBookingToAccept(booking);
    setTableNumber('');
    setAcceptDialogOpen(true);
  };

  const confirmAccept = async () => {
    if (!bookingToAccept) return;
    
    const tableNum = parseInt(tableNumber);
    if (!tableNumber || isNaN(tableNum) || tableNum < 1) {
      toast.error('Please enter a valid table number');
      return;
    }

    const { error } = await supabase
      .from('table_bookings')
      .update({ status: 'accepted', table_number: tableNum })
      .eq('id', bookingToAccept.id);

    if (error) {
      toast.error('Failed to accept booking');
      return;
    }

    // Create notification for the booking
    await supabase.from('notifications').insert({
      type: 'booking',
      title: 'Booking Accepted',
      message: `${bookingToAccept.name}'s booking for ${bookingToAccept.date} has been accepted. Table #${tableNum} assigned.`,
    });

    setBookings(prev => prev.map(b => 
      b.id === bookingToAccept.id ? { ...b, status: 'accepted', table_number: tableNum } : b
    ));
    toast.success(`Booking accepted! Table #${tableNum} assigned.`);
    setAcceptDialogOpen(false);
    setBookingToAccept(null);
    setSelectedBooking(null);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('table_bookings')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update booking');
      return;
    }

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    toast.success(`Booking ${status}`);
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.accepted}</p>
              <p className="text-sm text-muted-foreground">Accepted</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <X className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Reservations
            </CardTitle>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-semibold text-primary">
                      {booking.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{booking.name}</h4>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      {booking.table_number && (
                        <Badge variant="outline" className="text-primary border-primary">
                          <MapPin className="h-3 w-3 mr-1" />
                          Table #{booking.table_number}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        {formatDate(booking.date)}
                      </span>
                      <span>{booking.time}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.guests} guests
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-16 lg:ml-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    View Details
                  </Button>
                  {booking.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => openAcceptDialog(booking)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(booking.id, 'rejected')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filteredBookings.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No bookings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accept Booking Dialog - Assign Table */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Booking & Assign Table</DialogTitle>
          </DialogHeader>
          {bookingToAccept && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-medium">{bookingToAccept.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(bookingToAccept.date)} at {bookingToAccept.time} • {bookingToAccept.guests} guests
                </p>
              </div>
              <div>
                <Label htmlFor="tableNumber">Assign Table Number *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Enter table number (e.g., 5)"
                  className="mt-2"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAccept}>
              <Check className="h-4 w-4 mr-2" />
              Accept & Assign Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {selectedBooking.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedBooking.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusColor(selectedBooking.status)}>
                      {selectedBooking.status}
                    </Badge>
                    {selectedBooking.table_number && (
                      <Badge variant="outline" className="text-primary border-primary">
                        <MapPin className="h-3 w-3 mr-1" />
                        Table #{selectedBooking.table_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedBooking.date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{selectedBooking.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Party Size</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {selectedBooking.guests} guests
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Booked On</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${selectedBooking.email}`} className="hover:text-primary">
                    {selectedBooking.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${selectedBooking.phone}`} className="hover:text-primary">
                    {selectedBooking.phone}
                  </a>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Special Requests
                  </p>
                  <p className="p-3 rounded-lg bg-muted text-sm">
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              {selectedBooking.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      openAcceptDialog(selectedBooking);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept Booking
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => {
                      updateStatus(selectedBooking.id, 'rejected');
                      setSelectedBooking(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Booking
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;
