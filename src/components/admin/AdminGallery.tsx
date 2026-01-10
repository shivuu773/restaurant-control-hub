import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  sort_order: number | null;
}

const AdminGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState({ title: '', image_url: '' });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('sort_order');
    setImages(data || []);
    setLoading(false);
  };

  const openDialog = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
      setForm({ title: image.title || '', image_url: image.image_url });
    } else {
      setEditingImage(null);
      setForm({ title: '', image_url: '' });
    }
    setDialogOpen(true);
  };

  const saveImage = async () => {
    if (!form.image_url.trim()) {
      toast.error('Image URL is required');
      return;
    }

    if (editingImage) {
      const { error } = await supabase
        .from('gallery_images')
        .update({ title: form.title || null, image_url: form.image_url })
        .eq('id', editingImage.id);
      if (error) {
        toast.error('Failed to update image');
        return;
      }
      toast.success('Image updated');
    } else {
      const { error } = await supabase
        .from('gallery_images')
        .insert({ 
          title: form.title || null, 
          image_url: form.image_url,
          sort_order: images.length 
        });
      if (error) {
        toast.error('Failed to add image');
        return;
      }
      toast.success('Image added');
    }
    
    setDialogOpen(false);
    loadImages();
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete image');
      return;
    }
    toast.success('Image deleted');
    loadImages();
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
        <h3 className="text-lg font-semibold">Gallery Images ({images.length})</h3>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <div className="relative aspect-square">
              <img
                src={image.image_url}
                alt={image.title || 'Gallery image'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" onClick={() => openDialog(image)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteImage(image.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {image.title && (
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{image.title}</p>
              </CardContent>
            )}
          </Card>
        ))}
        {images.length === 0 && (
          <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4">
            <CardContent className="p-8 text-center text-muted-foreground">
              No gallery images yet. Add your first image!
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingImage ? 'Edit Image' : 'Add Image'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Image title"
              />
            </div>
            {form.image_url && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveImage}>
              {editingImage ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGallery;
