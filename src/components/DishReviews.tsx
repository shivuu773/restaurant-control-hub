import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import StarRating from './StarRating';
import { format } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
  } | null;
}

interface DishReviewsProps {
  menuItemId: string;
  showCount?: number;
}

const DishReviews = ({ menuItemId, showCount = 5 }: DishReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [menuItemId]);

  const loadReviews = async () => {
    // Get reviews with user profiles
    const { data, error } = await supabase
      .from('dish_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id
      `)
      .eq('menu_item_id', menuItemId)
      .order('created_at', { ascending: false })
      .limit(showCount);

    if (error) {
      console.error('Error loading reviews:', error);
      setLoading(false);
      return;
    }

    // Get profiles for reviews
    if (data && data.length > 0) {
      const userIds = data.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const reviewsWithProfiles = data.map(review => ({
        ...review,
        profiles: profiles?.find(p => p.user_id === review.user_id) || null
      }));

      setReviews(reviewsWithProfiles);

      // Calculate average
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAverageRating(avg);
      setTotalReviews(data.length);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-3 bg-muted rounded w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p>No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <StarRating rating={Math.round(averageRating)} readonly size="sm" />
        <span className="text-sm text-muted-foreground">
          {averageRating.toFixed(1)} ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
        </span>
      </div>

      {/* Reviews List */}
      <ScrollArea className="max-h-[200px]">
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-3 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {review.profiles?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">
                      {review.profiles?.full_name || 'Anonymous'}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {format(new Date(review.created_at), 'MMM d')}
                    </span>
                  </div>
                  <StarRating rating={review.rating} readonly size="sm" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DishReviews;
