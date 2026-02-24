-- Create simulator_control table for production serverless state management
-- This table allows stop/kill commands to work across different serverless instances

CREATE TABLE IF NOT EXISTS simulator_control (
  id INTEGER PRIMARY KEY DEFAULT 1,
  should_stop BOOLEAN DEFAULT false,
  session_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO simulator_control (id, should_stop, session_id)
VALUES (1, false, null)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE simulator_control ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anon users (simulator needs to work without auth)
CREATE POLICY "Allow all operations on simulator_control" ON simulator_control
  FOR ALL
  USING (true)
  WITH CHECK (true);
