-- Drop the insecure booking policy
DROP POLICY IF EXISTS "Users can create bookings" ON public.table_bookings;

-- Create a secure policy that requires authentication
CREATE POLICY "Authenticated users can create bookings" 
ON public.table_bookings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);