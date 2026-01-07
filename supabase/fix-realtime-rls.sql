-- Fix RLS policies for realtime to work
-- Run this in Supabase SQL Editor

-- Enable RLS on data_vme_test if not already enabled
ALTER TABLE data_vme_test ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON data_vme_test;
DROP POLICY IF EXISTS "Allow public write access" ON data_vme_test;
DROP POLICY IF EXISTS "Enable read access for all users" ON data_vme_test;
DROP POLICY IF EXISTS "Enable write access for all users" ON data_vme_test;

-- Create policy to allow anyone to read (required for realtime)
CREATE POLICY "Enable read access for all users" ON data_vme_test
    FOR SELECT
    USING (true);

-- Create policy to allow anyone to insert/update/delete
CREATE POLICY "Enable write access for all users" ON data_vme_test
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Same for data_vme table
ALTER TABLE data_vme ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON data_vme;
DROP POLICY IF EXISTS "Allow public write access" ON data_vme;
DROP POLICY IF EXISTS "Enable read access for all users" ON data_vme;
DROP POLICY IF EXISTS "Enable write access for all users" ON data_vme;

CREATE POLICY "Enable read access for all users" ON data_vme
    FOR SELECT
    USING (true);

CREATE POLICY "Enable write access for all users" ON data_vme
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify realtime is enabled for both tables
-- Go to Database > Replication and ensure both tables have realtime enabled
