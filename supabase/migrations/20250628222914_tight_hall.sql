/*
  # Create temples table and setup

  1. New Tables
    - `temples`
      - `id` (uuid, primary key)
      - `photo` (text, optional)
      - `name` (text, required)
      - `city` (text, required)
      - `abbreviation` (text, unique, required)
      - `address` (text, optional)
      - `founders` (text, optional)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on temples table
    - Add policies for authenticated users

  3. Initial Data
    - Insert default temples (SP and BH)
*/

-- Create temples table if it doesn't exist
CREATE TABLE IF NOT EXISTS temples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo text,
  name text NOT NULL,
  city text NOT NULL,
  abbreviation text NOT NULL UNIQUE,
  address text,
  founders text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'temples' AND n.nspname = 'public' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Allow authenticated users to read temples" ON temples;
  DROP POLICY IF EXISTS "Allow authenticated users to insert temples" ON temples;
  DROP POLICY IF EXISTS "Allow authenticated users to update temples" ON temples;
  DROP POLICY IF EXISTS "Allow authenticated users to delete temples" ON temples;
  
  -- Create new policies
  CREATE POLICY "Allow authenticated users to read temples"
    ON temples
    FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Allow authenticated users to insert temples"
    ON temples
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Allow authenticated users to update temples"
    ON temples
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

  CREATE POLICY "Allow authenticated users to delete temples"
    ON temples
    FOR DELETE
    TO authenticated
    USING (true);
END $$;

-- Create trigger for updated_at (only if the function exists and trigger doesn't exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_temples_updated_at ON temples;
    
    -- Create new trigger
    CREATE TRIGGER update_temples_updated_at 
      BEFORE UPDATE ON temples
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert initial temple data (only if they don't exist)
INSERT INTO temples (name, city, abbreviation, address, founders, is_active) 
SELECT * FROM (VALUES
  ('Templo São Paulo', 'São Paulo', 'SP', 'Rua das Flores, 123 - Centro, São Paulo - SP', 'João da Silva Santos, Paula Racy', true),
  ('Templo Belo Horizonte', 'Belo Horizonte', 'BH', 'Av. Afonso Pena, 456 - Centro, Belo Horizonte - MG', 'Maria Santos Oliveira', true)
) AS v(name, city, abbreviation, address, founders, is_active)
WHERE NOT EXISTS (
  SELECT 1 FROM temples WHERE temples.abbreviation = v.abbreviation
);