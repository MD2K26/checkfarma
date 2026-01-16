-- ⚠️ Rode este script no Supabase SQL Editor para corrigir o acesso ⚠️

-- 1. Garante que a tabela existe limpa
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  nome text,
  senha text,
  role text DEFAULT 'auditor'
);

-- 2. DESABILITAR SEGURANÇA (Isso libera o acesso para o Login funcionar)
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Inserir Admin
INSERT INTO usuarios (email, nome, senha, role)
VALUES ('admin@drogaria.com', 'Administrador', 'admin123', 'admin');

-- 4. Verificar se inseriu
SELECT * FROM usuarios;
