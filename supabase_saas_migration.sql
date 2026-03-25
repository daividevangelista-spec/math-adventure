-- ########################################################
-- MATH ADVENTURE+ SAAS & ROLE MIGRATION
-- ########################################################

-- 1. Garantir colunas de Role e Plano na tabela Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 2. Opcional: Restringir valores válidos via check constraints (segurança extra)
DO $$ 
BEGIN 
    ALTER TABLE public.profiles ADD CONSTRAINT check_role CHECK (role IN ('student', 'teacher'));
EXCEPTION 
    WHEN duplicate_object THEN null; 
END $$;

DO $$ 
BEGIN 
    ALTER TABLE public.profiles ADD CONSTRAINT check_plan CHECK (plan IN ('free', 'premium', 'school'));
EXCEPTION 
    WHEN duplicate_object THEN null; 
END $$;

-- 3. Políticas de RLS para o Professor (RBAC)
-- Somente produtores de conteúdo/professores podem criar turmas (exemplo)
DROP POLICY IF EXISTS "Professores podem criar turmas" ON public.turmas;
CREATE POLICY "Professores podem criar turmas" 
ON public.turmas FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- NOTA: Como o sistema já permite que qualquer um crie turmas por enquanto, 
-- essa política garante que apenas quem se identificar como 'teacher' terá sucesso no fluxo SaaS.
