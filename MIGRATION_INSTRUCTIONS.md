# Database Migration Instructions

The application is failing because the `temples` table doesn't exist in your Supabase database. You need to manually apply the migration since the Supabase CLI isn't available in this environment.

## Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the following SQL code:**

```sql
/*
  # Create temples table

  1. New Tables
    - `temples`
      - `id` (uuid, primary key)
      - `photo` (text, URL da foto)
      - `name` (text, nome do templo)
      - `city` (text, cidade)
      - `abbreviation` (text, abreviação como 'SP', 'BH')
      - `address` (text, endereço completo)
      - `founders` (jsonb, fundadores como array)
      - `is_active` (boolean, se está ativo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on temples table
    - Add policies for authenticated users
*/

-- Create temples table
CREATE TABLE IF NOT EXISTS temples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo text,
  name text NOT NULL,
  city text NOT NULL,
  abbreviation text NOT NULL UNIQUE,
  address text,
  founders jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;

-- Create policies for temples
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

-- Create trigger for updated_at (only if the function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    EXECUTE 'CREATE TRIGGER update_temples_updated_at BEFORE UPDATE ON temples
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END $$;

-- Insert initial temple data
INSERT INTO temples (name, city, abbreviation, address, founders, is_active) VALUES
('Templo São Paulo', 'São Paulo', 'SP', 'Rua das Flores, 123 - Centro, São Paulo - SP', '["João da Silva Santos", "Paula Racy"]'::jsonb, true),
('Templo Belo Horizonte', 'Belo Horizonte', 'BH', 'Av. Afonso Pena, 456 - Centro, Belo Horizonte - MG', '["Maria Santos Oliveira"]'::jsonb, true)
ON CONFLICT (abbreviation) DO NOTHING;

-- If the table already exists with text founders column, update it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'temples' AND column_name = 'founders' AND data_type = 'text'
  ) THEN
    -- First, update existing text data to jsonb format
    UPDATE temples 
    SET founders = CASE 
      WHEN founders IS NULL OR founders = '' THEN '[]'::jsonb
      ELSE jsonb_build_array(founders)
    END
    WHERE founders IS NULL OR founders = '' OR jsonb_typeof(founders::jsonb) != 'array';
    
    -- Then change the column type
    ALTER TABLE temples ALTER COLUMN founders TYPE jsonb USING 
      CASE 
        WHEN founders IS NULL OR founders = '' THEN '[]'::jsonb
        WHEN jsonb_typeof(founders::jsonb) = 'array' THEN founders::jsonb
        ELSE jsonb_build_array(founders)
      END;
      
    -- Set default value
    ALTER TABLE temples ALTER COLUMN founders SET DEFAULT '[]'::jsonb;
  END IF;
END $$;
```

4. **Run the query**
   - Click the "Run" button to execute the SQL
   - You should see a success message

5. **Refresh your application**
   - Go back to your application and refresh the page
   - The temples table should now be available and the errors should be resolved

## What this does:

- Creates the `temples` table with `founders` as `jsonb` type (array format)
- Sets up Row Level Security (RLS) policies
- Adds the update trigger (if the function exists)
- Inserts initial temple data with founders as JSON arrays
- Includes migration logic to convert existing `text` founders column to `jsonb`
- Uses `ON CONFLICT DO NOTHING` to prevent duplicate entries if run multiple times

## Important Notes:

- The `founders` column is now stored as `jsonb` which allows it to be treated as an array in the frontend
- Existing data will be automatically converted from text to array format
- Empty or null founders will be converted to empty arrays `[]`

After running this SQL in your Supabase dashboard, your application should work correctly without the "founders.map is not a function" errors.