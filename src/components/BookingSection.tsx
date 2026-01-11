import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BookingSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ 
        title: 'Authentication Required', 
        description: 'Please log in to make a reservation.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('table_bookings').insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        special_requests: formData.specialRequests || null,
      });

      if (error) throw error;

      // Create notification for admin
      await supabase.from('notifications').insert({
        type: 'booking',
        title: 'New Table Booking',
        message: `${formData.name} booked a table for ${formData.guests} guests on ${formData.date}`,
        data: { booking_name: formData.name, guests: formData.guests },
      });

      toast({
        title: 'Booking Submitted!',
        description: 'We will confirm your reservation soon.',
      });

      setFormData({ name: '', email: '', phone: '', date: '', time: '', guests: '2', specialRequests: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit booking. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="book-a-table" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2>Reservation</h2>
          <p>Book a <span>Table</span></p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-card rounded-2xl p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Your Name" className="pl-10" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="email" placeholder="Your Email" className="pl-10" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Your Phone" className="pl-10" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="date" className="pl-10" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="time" className="pl-10" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="number" min="1" max="20" placeholder="Guests" className="pl-10" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <Textarea placeholder="Special Requests (optional)" value={formData.specialRequests} onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })} />
            </div>
            <div className="md:col-span-2 text-center">
              <Button type="submit" className="btn-book px-12" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Book a Table'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default BookingSection;
