-- Create tables for Pharmacy Audit App

CREATE TABLE IF NOT EXISTS lojas (
  id text PRIMARY KEY,
  nome text,
  cidade text,
  ativa boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS auditorias (
  id text PRIMARY KEY,
  tipo text,
  loja_id text REFERENCES lojas(id),
  usuario_email text,
  score integer,
  latitude float8,
  longitude float8,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itens_auditoria (
  id text PRIMARY KEY,
  auditoria_id text REFERENCES auditorias(id),
  item text,
  status text,
  observacao text,
  foto_url text
);

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  nome text,
  senha text,
  role text DEFAULT 'auditor' -- 'admin' or 'auditor'
);

-- Seed default admin user (admin@drogaria.com / admin123)
INSERT INTO usuarios (email, nome, senha, role)
VALUES ('admin@drogaria.com', 'Administrador', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS admins (
  email text PRIMARY KEY,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  loja_id text REFERENCES lojas(id),
  created_at timestamp DEFAULT now(),
  UNIQUE(email, loja_id)
);

-- Seed real stores with cities
INSERT INTO lojas (id, nome, cidade, ativa) VALUES 
('CDA', 'CDA', 'DIVINOPOLIS', true),
('CDABC', 'CD-DROGARIA ABC', 'DIVINOPOLIS', true),
('LJ01', 'DROGARIA ABC LJ 01', 'DIVINOPOLIS', true),
('LJ02', 'DROGARIA ABC LJ 02', 'DIVINOPOLIS', true),
('LJ03', 'DROGARIA ABC LJ 03', 'DIVINOPOLIS', true),
('LJ06', 'DROGARIA ABC LJ 06', 'DIVINOPOLIS', true),
('LJ07', 'DROGARIA ABC LJ 07', 'DIVINOPOLIS', true),
('LJ08', 'DROGARIA ABC LJ 08', 'FORMIGA', true),
('LJ12', 'DROGARIA ABC LJ 12', 'PARA DE MINAS', true),
('LJ20', 'DROGARIA ABC LJ 20', 'LAGOA DA PRATA', true),
('LJ22', 'DROGARIA ABC LJ 22', 'OLIVEIRA', true),
('LJ23', 'DROGARIA ABC LJ 23', 'LAVRAS', true),
('LJ24', 'DROGARIA ABC LJ 24', 'PASSOS', true),
('LJ26', 'DROGARIA ABC LJ 26', 'BETIM', true),
('LJ27', 'DROGARIA ABC LJ 27', 'VARGINHA', true),
('LJ28', 'DROGARIA ABC LJ 28', 'PIUMHI', true),
('LJ29', 'DROGARIA ABC LJ 29', 'CAMPO BELO', true),
('LJ30', 'DROGARIA ABC LJ 30', 'ARCOS', true),
('LJ31', 'DROGARIA ABC LJ 31', 'SANTO ANTONIO DO MONTE', true),
('LJ32', 'DROGARIA ABC LJ 32', 'ARAXA', true),
('LJ33', 'DROGARIA ABC LJ 33', 'NOVA SERRANA', true),
('LJ34', 'DROGARIA ABC LJ 34', 'PASSOS', true),
('LJ35', 'DROGARIA ABC LJ 35', 'BOA ESPERANCA', true),
('LJ48', 'DROGARIA ABC LJ 48', 'ITUIUTABA', true),
('LJ500', 'DROGARIA ABC LJ 500', 'PATOS DE MINAS', true),
('LJ503', 'DROGARIA ABC LJ 503', 'POUSO ALEGRE', true),
('LJ504', 'DRUGSTORE ABC LJ 504', 'DIVINOPOLIS', true),
('LJ505', 'DRUGSTORE ABC LJ 505', 'ALFENAS', true),
('LJ506', 'DRUGSTORE ABC LJ 506', 'ITAUNA', true),
('LJ507', 'DRUGSTORE ABC LJ 507', 'PARAISOPOLIS', true),
('LJ508', 'DRUGSTORE ABC LJ 508', 'CLAUDIO', true),
('LJ509', 'DRUGSTORE ABC LJ 509', 'CANDEIAS', true),
('LJ510', 'DRUGSTORE ABC LJ 510', 'BAMBUI', true)
ON CONFLICT (id) DO NOTHING;
