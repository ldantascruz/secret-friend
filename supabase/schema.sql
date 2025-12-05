-- Grupos de amigo secreto
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL, -- código público (ex: FAMILIA2024)
  name VARCHAR(255) NOT NULL,
  suggested_value DECIMAL(10,2),
  event_date DATE,
  organizer_phone VARCHAR(20),
  is_drawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participantes
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  access_code VARCHAR(50) UNIQUE NOT NULL, -- código único do participante
  drawn_participant_id UUID REFERENCES participants(id), -- quem essa pessoa tirou
  has_viewed_result BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lista de desejos (até 3 por participante)
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  position INT CHECK (position BETWEEN 1 AND 3),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, position)
);

-- Índices para performance
CREATE INDEX idx_groups_code ON groups(code);
CREATE INDEX idx_participants_group ON participants(group_id);
CREATE INDEX idx_participants_access_code ON participants(access_code);

-- Função para gerar código do grupo
CREATE OR REPLACE FUNCTION generate_group_code()
RETURNS VARCHAR AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
