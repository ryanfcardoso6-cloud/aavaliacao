-- =================================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) - GELATO BORELLI
-- Copie e cole no "SQL Editor" do Supabase e clique em "Run"
-- =================================================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InternalNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplaintHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StoreConfig" ENABLE ROW LEVEL SECURITY;

-- 2. Conceder acesso total irrestrito para a conexão do nosso Backend Next.js / Prisma (service_role e postgres)
-- Isso garante que seu painel administrativo e APIs do Next.js funcionem perfeitamente sem bloqueios
CREATE POLICY "Acesso total para o Backend em User" 
    ON "User" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em Table" 
    ON "Table" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em Review" 
    ON "Review" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em Complaint" 
    ON "Complaint" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em InternalNote" 
    ON "InternalNote" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em ComplaintHistory" 
    ON "ComplaintHistory" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em AuditEvent" 
    ON "AuditEvent" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

CREATE POLICY "Acesso total para o Backend em StoreConfig" 
    ON "StoreConfig" FOR ALL 
    TO postgres, service_role 
    USING (true) WITH CHECK (true);

-- 3. Políticas opcionais para acesso direto da API pública (anon) do Supabase:
-- Bloqueia leitura de dados sensíveis e permite apenas leitura das mesas e configs públicas
CREATE POLICY "Permitir leitura pública das Mesas ativas" 
    ON "Table" FOR SELECT 
    TO anon 
    USING ("active" = true);

CREATE POLICY "Permitir leitura pública das Configurações da Loja" 
    ON "StoreConfig" FOR SELECT 
    TO anon 
    USING (true);
