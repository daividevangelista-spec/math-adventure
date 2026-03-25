-- ########################################################
-- MATH ADVENTURE+ SEED & AUTOMATION SCRIPT
-- ########################################################

-- 1. Inserir Dados de Exemplo no Ranking Global
-- (Para o ranking não aparecer vazio no início)
INSERT INTO public.rankings_global (anon_id, xp_semana, pais, posicao)
VALUES 
  ('Lucas_Math', 2450, 'BR', 1),
  ('Ana_Estrela', 2100, 'BR', 2),
  ('Mestre_Soma', 1850, 'BR', 3),
  ('Calculadora_Humana', 1500, 'BR', 4),
  ('Ninja_Divisao', 1200, 'BR', 5)
ON CONFLICT DO NOTHING;

-- 2. Função para Calcular Média da Turma Automaticamente
-- (Roda sempre que um aluno ganha XP)
CREATE OR REPLACE FUNCTION update_turma_media()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.turmas
  SET media_turma = (
    SELECT AVG(xp) 
    FROM public.stats_turma 
    WHERE turma_id = NEW.turma_id
  )
  WHERE id = NEW.turma_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Gatilho (Trigger) para a Função acima
DROP TRIGGER IF EXISTS tr_update_turma_media ON public.stats_turma;
CREATE TRIGGER tr_update_turma_media
AFTER INSERT OR UPDATE ON public.stats_turma
FOR EACH ROW
EXECUTE FUNCTION update_turma_media();

-- ########################################################
-- DADOS INSERIDOS E AUTOMAÇÃO ATIVA! 🚀
-- ########################################################
