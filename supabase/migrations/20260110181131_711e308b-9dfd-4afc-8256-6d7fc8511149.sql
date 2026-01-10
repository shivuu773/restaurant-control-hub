-- Add table_number column to table_bookings
ALTER TABLE public.table_bookings 
ADD COLUMN IF NOT EXISTS table_number integer NULL;

-- Add a comment for clarity
COMMENT ON COLUMN public.table_bookings.table_number IS 'Assigned table number when booking is accepted';