-- ########################################################
-- MATH ADVENTURE+ TOTAL REPAIR SCRIPT (FIX - RODAR ESTE!)
-- ########################################################

-- 1. Tabela de Perfis (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'student',
  plan TEXT DEFAULT 'free',
  avatar_url TEXT,
  grade TEXT DEFAULT '3º',
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- UPDATE SAFAMENTE as colunas caso a tabela já exista
BEGIN;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

  -- Garantir que a coluna aluno_id exista em todas as tabelas (evita erro "column does not exist" nas políticas)
  ALTER TABLE IF EXISTS public.stats_turma ADD COLUMN IF NOT EXISTS aluno_id UUID;
  ALTER TABLE IF EXISTS public.rankings_global ADD COLUMN IF NOT EXISTS aluno_id UUID;
  ALTER TABLE IF EXISTS public.resultados_prova ADD COLUMN IF NOT EXISTS aluno_id UUID;
  ALTER TABLE IF EXISTS public.student_activity ADD COLUMN IF NOT EXISTS aluno_id UUID;
COMMIT;

-- Correção Definitiva de UUID vs TEXT (Contornando Restrições UNIQUE do PostgreSQL)
DO $$ BEGIN 
  ALTER TABLE public.stats_turma DROP CONSTRAINT IF EXISTS stats_turma_turma_id_aluno_id_key;
  ALTER TABLE public.stats_turma ALTER COLUMN aluno_id TYPE UUID USING aluno_id::uuid;
  ALTER TABLE public.stats_turma ADD CONSTRAINT stats_turma_turma_id_aluno_id_key UNIQUE(turma_id, aluno_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN 
  ALTER TABLE public.resultados_prova DROP CONSTRAINT IF EXISTS resultados_prova_prova_id_aluno_id_key;
  ALTER TABLE public.resultados_prova ALTER COLUMN aluno_id TYPE UUID USING aluno_id::uuid;
  ALTER TABLE public.resultados_prova ADD CONSTRAINT resultados_prova_prova_id_aluno_id_key UNIQUE(prova_id, aluno_id);
EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN ALTER TABLE public.rankings_global ALTER COLUMN aluno_id TYPE UUID USING aluno_id::uuid; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.student_activity ALTER COLUMN aluno_id TYPE UUID USING aluno_id::uuid; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 2. Tabela de Turmas
CREATE TABLE IF NOT EXISTS public.turmas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nome_turma TEXT NOT NULL,
  prof_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alunos_count INTEGER DEFAULT 0,
  media_acerto NUMERIC DEFAULT 0,
  media_turma NUMERIC DEFAULT 0, -- Adicionado para média de XP
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Estatísticas dos Alunos na Turma (Agora com Status de Aprovação)
CREATE TABLE IF NOT EXISTS public.stats_turma (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL,
  nome_aluno TEXT NOT NULL,
  status TEXT DEFAULT 'accepted', -- 'pending' | 'accepted'
  xp INTEGER DEFAULT 0,
  acertos_ops INTEGER DEFAULT 0,
  total_ops INTEGER DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT now(),
  UNIQUE(turma_id, aluno_id)
);

-- 4. Ranking Global (Para busca e exibição)
CREATE TABLE IF NOT EXISTS public.rankings_global (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL, -- UUID do auth para busca
  anon_id TEXT, -- Nome para o ranking global 
  nome_aluno TEXT, -- Nome real para o professor ver
  xp_semana INTEGER DEFAULT 0,
  pais TEXT DEFAULT 'BR',
  posicao INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabelas de Provas (Exams)
CREATE TABLE IF NOT EXISTS public.provas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  quantidade_questoes INTEGER NOT NULL DEFAULT 10,
  tempo_limite INTEGER NOT NULL DEFAULT 300,
  allow_retry BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.resultados_prova (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prova_id UUID REFERENCES public.provas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL,
  nome_aluno TEXT NOT NULL,
  nota NUMERIC NOT NULL DEFAULT 0,
  tempo_gasto INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(prova_id, aluno_id)
);

-- 6. Habilitar RLS em TUDO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats_turma ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_prova ENABLE ROW LEVEL SECURITY;

-- 7. Hardened RLS Policies (Fase 4 - Segurança Industrial)
-- Regra de Bypass para Administrador (Daivid Evang)
-- UID: 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691'

-- Profiles
DROP POLICY IF EXISTS "Public Access" ON public.profiles;
CREATE POLICY "Profiles - Select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles - Insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Profiles - Update" ON public.profiles FOR UPDATE USING (auth.uid()::text = id::text OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- Turmas
DROP POLICY IF EXISTS "Total Access Turmas" ON public.turmas;
CREATE POLICY "Turmas - Select" ON public.turmas FOR SELECT USING (true);
CREATE POLICY "Turmas - Create" ON public.turmas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Turmas - Manage" ON public.turmas FOR ALL USING (auth.uid()::text = prof_id::text OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- Rankings Global
DROP POLICY IF EXISTS "Total Access Global" ON public.rankings_global;
CREATE POLICY "Global - Select" ON public.rankings_global FOR SELECT USING (true);
CREATE POLICY "Global - Manage" ON public.rankings_global FOR ALL USING (auth.uid()::text = aluno_id::text OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- Stats Turma
DROP POLICY IF EXISTS "Total Access Stats" ON public.stats_turma;
CREATE POLICY "Stats - Select" ON public.stats_turma FOR SELECT USING (true);
CREATE POLICY "Stats - Join" ON public.stats_turma FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Stats - Update" ON public.stats_turma FOR UPDATE USING (auth.uid()::text = aluno_id::text OR EXISTS (SELECT 1 FROM public.turmas WHERE id::text = turma_id::text AND prof_id::text = auth.uid()::text) OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');
CREATE POLICY "Stats - Delete" ON public.stats_turma FOR DELETE USING (EXISTS (SELECT 1 FROM public.turmas WHERE id::text = turma_id::text AND prof_id::text = auth.uid()::text) OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- Provas
DROP POLICY IF EXISTS "Total Access Provas" ON public.provas;
CREATE POLICY "Provas - Select" ON public.provas FOR SELECT USING (true);
CREATE POLICY "Provas - Manage" ON public.provas FOR ALL USING (EXISTS (SELECT 1 FROM public.turmas WHERE id::text = turma_id::text AND prof_id::text = auth.uid()::text) OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- Resultados
DROP POLICY IF EXISTS "Total Access Resultados" ON public.resultados_prova;
CREATE POLICY "Resultados - Select" ON public.resultados_prova FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Resultados - Manage" ON public.resultados_prova FOR ALL USING (auth.uid()::text = aluno_id::text OR EXISTS (SELECT 1 FROM public.provas p JOIN public.turmas t ON p.turma_id::text = t.id::text WHERE p.id::text = prova_id::text AND t.prof_id::text = auth.uid()::text) OR auth.uid()::text = 'ce33d263-d3a5-497b-b8eb-ae8d8a98f691');

-- 8. Automação de Analytics para Turmas
CREATE OR REPLACE FUNCTION update_turma_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.turmas
  SET 
    alunos_count = (SELECT count(*) FROM public.stats_turma WHERE turma_id::text = COALESCE(NEW.turma_id, OLD.turma_id)::text),
    media_acerto = (
      SELECT COALESCE(AVG(CASE WHEN total_ops > 0 THEN (acertos_ops::numeric / total_ops::numeric) * 100 ELSE 0 END), 0)
      FROM public.stats_turma 
      WHERE turma_id::text = COALESCE(NEW.turma_id, OLD.turma_id)::text
    )
  WHERE id::text = COALESCE(NEW.turma_id, OLD.turma_id)::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_turma_analytics ON public.stats_turma;
CREATE TRIGGER tr_update_turma_analytics
AFTER INSERT OR UPDATE OR DELETE ON public.stats_turma
FOR EACH ROW
EXECUTE FUNCTION update_turma_analytics();

-- 9. Habilitar Realtime para tudo
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.turmas; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.stats_turma; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.provas; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.resultados_prova; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Destruir versões antigas conflitantes
DROP FUNCTION IF EXISTS public.increment_student_stats(UUID, INTEGER, INTEGER, INTEGER, UUID);
DROP FUNCTION IF EXISTS public.increment_student_stats(TEXT, INTEGER, INTEGER, INTEGER, UUID);

-- 10. Funções de Incremento Atômico
CREATE OR REPLACE FUNCTION public.increment_student_stats(
    aluno_id_in UUID, 
    xp_to_add INTEGER, 
    correct_to_add INTEGER, 
    total_to_add INTEGER,
    turma_id_in UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- 1. Incrementa no Perfil Global (profiles)
    UPDATE public.profiles 
    SET xp = COALESCE(xp, 0) + xp_to_add,
        level = floor((COALESCE(xp, 0) + xp_to_add) / 100) + 1
    WHERE id::text = aluno_id_in::text;

    -- 2. Incrementa/Upsert na Turma (se especificada)
    IF turma_id_in IS NOT NULL THEN
        INSERT INTO public.stats_turma (turma_id, aluno_id, nome_aluno, xp, acertos_ops, total_ops, last_update, status)
        SELECT turma_id_in, aluno_id_in::uuid, name, xp_to_add, correct_to_add, total_to_add, now(), 'accepted'
        FROM public.profiles WHERE id::text = aluno_id_in::text
        ON CONFLICT (turma_id, aluno_id) DO UPDATE SET
            xp = public.stats_turma.xp + xp_to_add,
            acertos_ops = public.stats_turma.acertos_ops + correct_to_add,
            total_ops = public.stats_turma.total_ops + total_to_add,
            last_update = now();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Tabela de Log de Atividades
CREATE TABLE IF NOT EXISTS public.student_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aluno_id UUID NOT NULL,
    nome_aluno TEXT,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'xp_gain', 'prova_concluida', 'level_up'
    descricao TEXT,
    valor JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Total Access Activity" ON public.student_activity FOR ALL USING (true) WITH CHECK (true);

-- Habilitar Realtime para Atividades
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.student_activity; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

