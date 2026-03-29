-- Schema template pour chaque tenant NORMX Legal
-- Remplacer ${schema} par le nom du schema (ex: tenant_org_alpha)

CREATE SCHEMA IF NOT EXISTS "${schema}";

CREATE TABLE IF NOT EXISTS "${schema}".users (
  id SERIAL PRIMARY KEY,
  keycloak_sub VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL DEFAULT '',
  prenom VARCHAR(255) NOT NULL DEFAULT '',
  telephone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schema}".documents (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id INTEGER REFERENCES "${schema}".users(id),
  type VARCHAR(100) NOT NULL,
  denomination VARCHAR(255),
  forme_juridique VARCHAR(100),
  docx_path TEXT,
  pdf_path TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schema}".conversations (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id INTEGER REFERENCES "${schema}".users(id),
  title VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "${schema}".messages (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversation_id VARCHAR(255) REFERENCES "${schema}".conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_documents_user ON "${schema}".documents(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON "${schema}".conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON "${schema}".messages(conversation_id);
