import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ContactSection = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await supabase.from('contact_messages').insert(formData);
      await supabase.from('notifications').insert({ type: 'message', title: 'New Contact Message', message: `${formData.name} sent a message: ${formData.subject}` });
      toast({ title: 'Message Sent!', description: 'We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: 'Location', text: settings.address },
    { icon: Clock, title: 'Open Hours', text: settings.opening_hours },
    { icon: Mail, title: 'Email Us', text: settings.email },
    { icon: Phone, title: 'Call Us', text: settings.phone },
  ];

  return (
    <section id="contact" className="py-20 bg-section">
      <div className="container mx-auto px-4">
        <div className="section-header">
          <h2>Contact</h2>
          <p>Get In <span>Touch</span></p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-lg font-semibold">{item.title}</h4>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                <Input type="email" placeholder="Your Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <Input placeholder="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              <Textarea placeholder="Message" rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
              <Button type="submit" className="btn-book w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Message'}</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
