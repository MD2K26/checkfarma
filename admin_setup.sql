-- Execute this in Supabase SQL Editor
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

-- ADD YOUR EMAIL AS ADMIN
-- INSERT INTO admins (email) VALUES ('seu-email@gmail.com');
