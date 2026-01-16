-- ⚠️ CUIDADO: ESTE SCRIPT APAGA TODOS OS DADOS!

-- 1. Remover tabelas existentes (Ordem importa por causa das chaves estrangeiras)
DROP TABLE IF EXISTS itens_auditoria;
DROP TABLE IF EXISTS auditorias;
DROP TABLE IF EXISTS lojas;
DROP TABLE IF EXISTS usuarios;

-- 2. Recriar tabelas
CREATE TABLE lojas (
  id text PRIMARY KEY,
  nome text,
  cidade text,
  ativa boolean DEFAULT true
);

CREATE TABLE auditorias (
  id text PRIMARY KEY,
  tipo text,
  loja_id text REFERENCES lojas(id),
  usuario_email text,
  score integer,
  created_at timestamp DEFAULT now()
);

CREATE TABLE itens_auditoria (
  id text PRIMARY KEY,
  auditoria_id text REFERENCES auditorias(id),
  item text,
  status text,
  observacao text,
  foto_url text
);

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  nome text
);

-- 3. Inserir dados iniciais (Seed)
INSERT INTO lojas (id, nome, cidade) VALUES 
('1', 'Loja Matriz', 'São Paulo'),
('2', 'Loja Shopping', 'Campinas');

-- Finalizado
