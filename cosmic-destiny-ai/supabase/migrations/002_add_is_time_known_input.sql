-- Add is_time_known_input column to user_reports table
ALTER TABLE public.user_reports 
ADD COLUMN IF NOT EXISTS is_time_known_input BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN public.user_reports.is_time_known_input IS 'Indicates whether the user provided a specific birth time (true) or if it was defaulted to 12:00 (false)';
