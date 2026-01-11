-- Create dish reviews table
CREATE TABLE public.dish_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, menu_item_id)
);

-- Enable RLS
ALTER TABLE public.dish_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view reviews"
ON public.dish_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.dish_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.dish_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.dish_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_dish_reviews_menu_item ON public.dish_reviews(menu_item_id);
CREATE INDEX idx_dish_reviews_user ON public.dish_reviews(user_id);
CREATE INDEX idx_dish_reviews_rating ON public.dish_reviews(rating);

-- Add trigger for updated_at
CREATE TRIGGER update_dish_reviews_updated_at
BEFORE UPDATE ON public.dish_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();