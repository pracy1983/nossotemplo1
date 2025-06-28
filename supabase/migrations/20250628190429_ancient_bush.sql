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
      - `founders` (text, fundadores)
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
  founders text,
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

-- Create trigger for updated_at
CREATE TRIGGER update_temples_updated_at BEFORE UPDATE ON temples
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial temple data
INSERT INTO temples (name, city, abbreviation, address, founders, is_active) VALUES
('Templo São Paulo', 'São Paulo', 'SP', 'Rua das Flores, 123 - Centro, São Paulo - SP', 'João da Silva Santos, Paula Racy', true),
('Templo Belo Horizonte', 'Belo Horizonte', 'BH', 'Av. Afonso Pena, 456 - Centro, Belo Horizonte - MG', 'Maria Santos Oliveira', true);