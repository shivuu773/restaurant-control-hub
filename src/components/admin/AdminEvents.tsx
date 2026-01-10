import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  is_active: boolean | null;
  sort_order: number | null;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    is_active: true,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('sort_order');
    setEvents(data || []);
    setLoading(false);
  };

  const openDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setForm({
        title: event.title,
        description: event.description || '',
        image_url: event.image_url || '',
        price: event.price?.toString() || '',
        is_active: event.is_active ?? true,
      });
    } else {
      setEditingEvent(null);
      setForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const saveEvent = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const data = {
      title: form.title,
      description: form.description || null,
      image_url: form.image_url || null,
      price: form.price ? parseFloat(form.price) : null,
      is_active: form.is_active,
    };

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update(data)
        .eq('id', editingEvent.id);
      if (error) {
        toast.error('Failed to update event');
        return;
      }
      toast.success('Event updated');
    } else {
      const { error } = await supabase
        .from('events')
        .insert({ ...data, sort_order: events.length });
      if (error) {
        toast.error('Failed to add event');
        return;
      }
      toast.success('Event added');
    }
    
    setDialogOpen(false);
    loadEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete event');
      return;
    }
    toast.success('Event deleted');
    loadEvents();
  };

  const toggleActive = async (event: Event) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !event.is_active })
      .eq('id', event.id);
    
    if (error) {
      toast.error('Failed to update event');
      return;
    }
    
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, is_active: !e.is_active } : e));
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Events ({events.length})</h3>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="p-4 flex gap-4">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-24 h-24 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      {!event.is_active && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {event.description}
                      </p>
                    )}
                    {event.price && (
                      <p className="text-primary font-semibold mt-2">
                        ₹{event.price}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={event.is_active ?? true}
                      onCheckedChange={() => toggleActive(event)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => openDialog(event)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteEvent(event.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No events yet. Add your first event!
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event Title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Event description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEvent}>
              {editingEvent ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
