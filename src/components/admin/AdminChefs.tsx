import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Chef {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  sort_order: number | null;
}

const AdminChefs = () => {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChef, setEditingChef] = useState<Chef | null>(null);
  const [form, setForm] = useState({
    name: '',
    role: '',
    image_url: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    loadChefs();
  }, []);

  const loadChefs = async () => {
    const { data } = await supabase
      .from('chefs')
      .select('*')
      .order('sort_order');
    setChefs(data || []);
    setLoading(false);
  };

  const openDialog = (chef?: Chef) => {
    if (chef) {
      setEditingChef(chef);
      setForm({
        name: chef.name,
        role: chef.role,
        image_url: chef.image_url || '',
        facebook_url: chef.facebook_url || '',
        twitter_url: chef.twitter_url || '',
        instagram_url: chef.instagram_url || '',
      });
    } else {
      setEditingChef(null);
      setForm({
        name: '',
        role: '',
        image_url: '',
        facebook_url: '',
        twitter_url: '',
        instagram_url: '',
      });
    }
    setDialogOpen(true);
  };

  const saveChef = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      toast.error('Name and role are required');
      return;
    }

    const data = {
      name: form.name,
      role: form.role,
      image_url: form.image_url || null,
      facebook_url: form.facebook_url || null,
      twitter_url: form.twitter_url || null,
      instagram_url: form.instagram_url || null,
    };

    if (editingChef) {
      const { error } = await supabase
        .from('chefs')
        .update(data)
        .eq('id', editingChef.id);
      if (error) {
        toast.error('Failed to update chef');
        return;
      }
      toast.success('Chef updated');
    } else {
      const { error } = await supabase
        .from('chefs')
        .insert({ ...data, sort_order: chefs.length });
      if (error) {
        toast.error('Failed to add chef');
        return;
      }
      toast.success('Chef added');
    }
    
    setDialogOpen(false);
    loadChefs();
  };

  const deleteChef = async (id: string) => {
    if (!confirm('Delete this chef?')) return;
    
    const { error } = await supabase.from('chefs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete chef');
      return;
    }
    toast.success('Chef deleted');
    loadChefs();
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
        <h3 className="text-lg font-semibold">Chefs ({chefs.length})</h3>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Chef
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {chefs.map((chef) => (
          <Card key={chef.id} className="overflow-hidden">
            <div className="aspect-[3/4] relative">
              {chef.image_url ? (
                <img
                  src={chef.image_url}
                  alt={chef.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">
                    {chef.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="icon" variant="secondary" onClick={() => openDialog(chef)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteChef(chef.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold text-lg">{chef.name}</h4>
              <p className="text-primary">{chef.role}</p>
              <div className="flex gap-2 mt-3">
                {chef.facebook_url && (
                  <a href={chef.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {chef.twitter_url && (
                  <a href={chef.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {chef.instagram_url && (
                  <a href={chef.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {chefs.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-8 text-center text-muted-foreground">
              No chefs added yet. Add your first chef!
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingChef ? 'Edit Chef' : 'Add Chef'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Chef Name"
              />
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g., Executive Chef"
              />
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
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={form.facebook_url}
                  onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                  placeholder="URL"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  value={form.twitter_url}
                  onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                  placeholder="URL"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={form.instagram_url}
                  onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  placeholder="URL"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveChef}>
              {editingChef ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChefs;
