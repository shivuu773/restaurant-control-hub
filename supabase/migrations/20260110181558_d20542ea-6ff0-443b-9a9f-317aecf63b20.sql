-- Add RLS policy to allow users to update their own bookings (for cancellation)
CREATE POLICY "Users can cancel their own pending bookings" 
ON public.table_bookings 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');