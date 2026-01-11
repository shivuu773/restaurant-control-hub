-- Drop the restrictive INSERT policy and recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.table_bookings;

CREATE POLICY "Authenticated users can create bookings"
ON public.table_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);