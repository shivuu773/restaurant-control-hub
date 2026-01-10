import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
  sort_order: number;
}

const AdminMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Category Dialog
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  
  // Menu Item Dialog
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    is_available: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase.from('menu_categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*').order('sort_order'),
    ]);
    setCategories(cats || []);
    setMenuItems(items || []);
    setLoading(false);
  };

  // Category Functions
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setCategoryDialog(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      const { error } = await supabase
        .from('menu_categories')
        .update({ name: categoryName })
        .eq('id', editingCategory.id);
      if (error) {
        toast.error('Failed to update category');
        return;
      }
      toast.success('Category updated');
    } else {
      const { error } = await supabase
        .from('menu_categories')
        .insert({ name: categoryName, sort_order: categories.length });
      if (error) {
        toast.error('Failed to create category');
        return;
      }
      toast.success('Category created');
    }
    
    setCategoryDialog(false);
    loadData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Items in this category will become uncategorized.')) return;
    
    await supabase.from('menu_items').update({ category_id: null }).eq('category_id', id);
    const { error } = await supabase.from('menu_categories').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete category');
      return;
    }
    toast.success('Category deleted');
    loadData();
  };

  // Menu Item Functions
  const openItemDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        image_url: item.image_url || '',
        category_id: item.category_id || '',
        is_available: item.is_available ?? true,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: '',
        is_available: true,
      });
    }
    setItemDialog(true);
  };

  const saveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.price) return;

    const data = {
      name: itemForm.name,
      description: itemForm.description || null,
      price: parseFloat(itemForm.price),
      image_url: itemForm.image_url || null,
      category_id: itemForm.category_id || null,
      is_available: itemForm.is_available,
    };

    if (editingItem) {
      const { error } = await supabase
        .from('menu_items')
        .update(data)
        .eq('id', editingItem.id);
      if (error) {
        toast.error('Failed to update item');
        return;
      }
      toast.success('Item updated');
    } else {
      const { error } = await supabase
        .from('menu_items')
        .insert({ ...data, sort_order: menuItems.length });
      if (error) {
        toast.error('Failed to create item');
        return;
      }
      toast.success('Item created');
    }
    
    setItemDialog(false);
    loadData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete item');
      return;
    }
    toast.success('Item deleted');
    loadData();
  };

  const toggleAvailability = async (item: MenuItem) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available })
      .eq('id', item.id);
    
    if (error) {
      toast.error('Failed to update availability');
      return;
    }
    
    setMenuItems(prev => 
      prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i)
    );
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
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
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">All Menu Items ({menuItems.length})</h3>
            <Button onClick={() => openItemDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="grid gap-4">
            {menuItems.map((item) => (
              <Card key={item.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold truncate">{item.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(item.category_id)}
                        </Badge>
                        {!item.is_available && (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description || 'No description'}
                      </p>
                      <p className="text-primary font-semibold mt-1">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_available ?? true}
                        onCheckedChange={() => toggleAvailability(item)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openItemDialog(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {menuItems.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No menu items yet. Add your first item!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Categories ({categories.length})</h3>
            <Button onClick={() => openCategoryDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const itemCount = menuItems.filter(i => i.category_id === category.id).length;
              return (
                <Card key={category.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{itemCount} items</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openCategoryDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {categories.length === 0 && (
              <Card className="bg-card border-border sm:col-span-2 lg:col-span-3">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No categories yet. Add your first category!
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">Name</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g., Appetizers"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCategory}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="itemName">Name *</Label>
              <Input
                id="itemName"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g., Butter Chicken"
              />
            </div>
            <div>
              <Label htmlFor="itemDescription">Description</Label>
              <Textarea
                id="itemDescription"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Describe the dish..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemPrice">Price *</Label>
                <Input
                  id="itemPrice"
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="itemCategory">Category</Label>
                <Select
                  value={itemForm.category_id}
                  onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="itemImage">Image URL</Label>
              <Input
                id="itemImage"
                value={itemForm.image_url}
                onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="itemAvailable">Available</Label>
              <Switch
                id="itemAvailable"
                checked={itemForm.is_available}
                onCheckedChange={(checked) => setItemForm({ ...itemForm, is_available: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveItem}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMenu;
