import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StarRating from './StarRating';
import { format } from 'date-fns';
import { 
  MessageSquare, 
  Star, 
  Pencil, 
  Trash2, 
  Loader2,
  UtensilsCrossed
} from 'lucide-react';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  image_url: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  menu_item_id: string;
  menu_items: {
    name: string;
    image_url: string | null;
  } | null;
}

const MyReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  // Form state
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadReviews();
      loadMenuItems();
    }
  }, [user]);

  const loadReviews = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dish_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        menu_item_id,
        menu_items (
          name,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reviews:', error);
    } else {
      setReviews((data as Review[]) || []);
    }
    setLoading(false);
  };

  const loadMenuItems = async () => {
    const { data } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .eq('is_available', true)
      .order('name');
    
    setMenuItems(data || []);
  };

  const handleSubmit = async () => {
    if (!user || !selectedMenuItem || rating < 1) {
      toast.error('Please select a dish and rating');
      return;
    }

    setSubmitting(true);

    try {
      if (editingReview) {
        const { error } = await supabase
          .from('dish_reviews')
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq('id', editingReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        const { error } = await supabase
          .from('dish_reviews')
          .insert({
            user_id: user.id,
            menu_item_id: selectedMenuItem,
            rating,
            comment: comment.trim() || null,
          });

        if (error) {
          if (error.code === '23505') {
            toast.error('You have already reviewed this dish');
          } else {
            throw error;
          }
          return;
        }
        toast.success('Review submitted successfully');
      }

      resetForm();
      setDialogOpen(false);
      loadReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setSelectedMenuItem(review.menu_item_id);
    setRating(review.rating);
    setComment(review.comment || '');
    setDialogOpen(true);
  };

  const handleDelete = async (reviewId: string) => {
    const { error } = await supabase
      .from('dish_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      loadReviews();
    }
  };

  const resetForm = () => {
    setEditingReview(null);
    setSelectedMenuItem('');
    setRating(5);
    setComment('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            My Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <Skeleton className="w-16 h-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          My Reviews
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Edit Review' : 'Write a Review'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Dish</label>
                <Select 
                  value={selectedMenuItem} 
                  onValueChange={setSelectedMenuItem}
                  disabled={!!editingReview}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a dish to review" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Rating</label>
                <StarRating 
                  rating={rating} 
                  onRatingChange={setRating}
                  size="lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Review (Optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this dish..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/500
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={submitting || !selectedMenuItem}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : editingReview ? (
                  'Update Review'
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No reviews yet</p>
            <p className="text-sm mt-1">Share your thoughts on the dishes you've tried</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="flex gap-4 p-4 border border-border rounded-lg"
                >
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {review.menu_items?.image_url ? (
                      <img 
                        src={review.menu_items.image_url} 
                        alt={review.menu_items.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium truncate">
                          {review.menu_items?.name || 'Deleted Item'}
                        </p>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(review)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MyReviews;
