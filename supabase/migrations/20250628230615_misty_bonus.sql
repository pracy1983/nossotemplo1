/*
  # Update temples table with new fields

  1. New Fields
    - `logo` (text, URL do logo personalizado)
    - `street` (text, rua)
    - `number` (text, número)
    - `neighborhood` (text, bairro)
    - `zip_code` (text, CEP)
    - `state` (text, estado)

  2. Changes
    - Add new columns to temples table
    - Update existing data structure
*/

-- Add new columns to temples table
ALTER TABLE temples ADD COLUMN IF NOT EXISTS logo text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS street text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS number text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS state text;

-- Update existing temples with parsed address data (if any exist)
UPDATE temples 
SET 
  street = CASE 
    WHEN address LIKE '%Rua%' THEN 
      TRIM(SPLIT_PART(SPLIT_PART(address, ',', 1), 'Rua ', 2))
    WHEN address LIKE '%Av.%' THEN 
      TRIM(SPLIT_PART(SPLIT_PART(address, ',', 1), 'Av. ', 2))
    ELSE NULL
  END,
  number = CASE 
    WHEN address LIKE '%,%' THEN 
      TRIM(SPLIT_PART(SPLIT_PART(address, ',', 2), ' -', 1))
    ELSE NULL
  END,
  neighborhood = CASE 
    WHEN address LIKE '%-%' THEN 
      TRIM(SPLIT_PART(SPLIT_PART(address, ' - ', 2), ',', 1))
    ELSE NULL
  END,
  state = CASE 
    WHEN abbreviation = 'SP' THEN 'SP'
    WHEN abbreviation = 'BH' THEN 'MG'
    ELSE NULL
  END,
  zip_code = CASE 
    WHEN abbreviation = 'SP' THEN '01000-000'
    WHEN abbreviation = 'BH' THEN '30000-000'
    ELSE NULL
  END
WHERE address IS NOT NULL;

-- Update temple names to follow new pattern
UPDATE temples 
SET name = 'Templo ' || abbreviation 
WHERE name NOT LIKE 'Templo %';