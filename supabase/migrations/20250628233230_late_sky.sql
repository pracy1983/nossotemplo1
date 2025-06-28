-- Add new columns to temples table for improved functionality
ALTER TABLE temples ADD COLUMN IF NOT EXISTS logo text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS complement text;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS observations text;

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
WHERE address IS NOT NULL AND street IS NULL;

-- Update temple names to follow new pattern (Templo + Abbreviation)
UPDATE temples 
SET name = 'Templo ' || abbreviation 
WHERE name NOT LIKE 'Templo %';

-- Add comment to document the new fields
COMMENT ON COLUMN temples.logo IS 'URL da imagem do logo quadrado personalizado da cidade';
COMMENT ON COLUMN temples.complement IS 'Complemento do endereço (apartamento, sala, etc.)';
COMMENT ON COLUMN temples.observations IS 'Observações gerais sobre o templo';