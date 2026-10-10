-- =================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - GELATO BORELLI (SUPABASE)
-- Copie e cole este código no "SQL Editor" do seu painel do Supabase e clique em "Run"
-- =================================================================

-- 1. TABELA DE USUÁRIOS DO SISTEMA
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ATTENDANT',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- 2. TABELA DE MESAS E QR CODES
CREATE TABLE IF NOT EXISTS "Table" (
    "id" TEXT PRIMARY KEY,
    "number" INTEGER UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Table_slug_idx" ON "Table"("slug");
CREATE INDEX IF NOT EXISTS "Table_token_idx" ON "Table"("token");

-- 3. TABELA DE AVALIAÇÕES DE CLIENTES
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "tableId" TEXT REFERENCES "Table"("id") ON DELETE SET NULL,
    "viewedByStaff" BOOLEAN NOT NULL DEFAULT false,
    "protocol" TEXT UNIQUE NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Review_rating_idx" ON "Review"("rating");
CREATE INDEX IF NOT EXISTS "Review_createdAt_idx" ON "Review"("createdAt");
CREATE INDEX IF NOT EXISTS "Review_protocol_idx" ON "Review"("protocol");

-- 4. TABELA DE RECLAMAÇÕES / OUVIDORIA
CREATE TABLE IF NOT EXISTS "Complaint" (
    "id" TEXT PRIMARY KEY,
    "reviewId" TEXT UNIQUE NOT NULL REFERENCES "Review"("id") ON DELETE CASCADE,
    "protocol" TEXT UNIQUE NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOVA',
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "contactPreference" TEXT,
    "requestContact" BOOLEAN NOT NULL DEFAULT false,
    "assignedToId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Complaint_status_idx" ON "Complaint"("status");
CREATE INDEX IF NOT EXISTS "Complaint_category_idx" ON "Complaint"("category");
CREATE INDEX IF NOT EXISTS "Complaint_createdAt_idx" ON "Complaint"("createdAt");
CREATE INDEX IF NOT EXISTS "Complaint_protocol_idx" ON "Complaint"("protocol");

-- 5. NOTAS INTERNAS DA EQUIPE
CREATE TABLE IF NOT EXISTS "InternalNote" (
    "id" TEXT PRIMARY KEY,
    "complaintId" TEXT NOT NULL REFERENCES "Complaint"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "InternalNote_complaintId_idx" ON "InternalNote"("complaintId");

-- 6. HISTÓRICO E AUDITORIA DE RECLAMAÇÕES
CREATE TABLE IF NOT EXISTS "ComplaintHistory" (
    "id" TEXT PRIMARY KEY,
    "complaintId" TEXT NOT NULL REFERENCES "Complaint"("id") ON DELETE CASCADE,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ComplaintHistory_complaintId_idx" ON "ComplaintHistory"("complaintId");

-- 7. EVENTOS DE AUDITORIA GERAL (LGPD / SEGURANÇA)
CREATE TABLE IF NOT EXISTS "AuditEvent" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AuditEvent_userId_idx" ON "AuditEvent"("userId");
CREATE INDEX IF NOT EXISTS "AuditEvent_resource_idx" ON "AuditEvent"("resource");
CREATE INDEX IF NOT EXISTS "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- 8. CONFIGURAÇÕES DA LOJA (GELATO BORELLI)
CREATE TABLE IF NOT EXISTS "StoreConfig" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "storeName" TEXT NOT NULL DEFAULT 'Gelato Borelli',
    "logoUrl" TEXT DEFAULT '/logo-borelli.png',
    "description" TEXT DEFAULT 'O verdadeiro gelato tradicional italiano',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Como foi sua experiência na Gelato Borelli hoje?',
    "subtitleMessage" TEXT NOT NULL DEFAULT 'Sua opinião é fundamental para aprimorarmos continuamente nosso atendimento.',
    "thankYouPositive" TEXT NOT NULL DEFAULT 'Grazie mille! Agradecemos imensamente o seu carinho e esperamos recebê-lo novamente em breve.',
    "thankYouNegative" TEXT NOT NULL DEFAULT 'Sentimos muito pelo ocorrido. Nossa gerência foi imediatamente notificada e entraremos em contato para solucionar.',
    "slaHours" INTEGER NOT NULL DEFAULT 24,
    "phone" TEXT DEFAULT '(16) 3620-1122',
    "email" TEXT DEFAULT 'sac@gelatoborelli.com.br',
    "address" TEXT DEFAULT 'Ribeirão Preto, SP',
    "businessHours" TEXT DEFAULT 'Todos os dias das 11h00 às 23h00',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- CARGA INICIAL DE DADOS (USUÁRIOS E MESAS DA GELATO BORELLI)
-- Senha de todos os usuários iniciais: AdminPassword123!
-- =================================================================

INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "active")
VALUES 
  ('usr_admin_borelli', 'Diretoria Borelli (Admin)', 'admin@borelli.com.br', '$2a$10$VYcC11t6PyFJF9K8QQqLjOcZiPpOuaKZybCO7cmNHrFlOR8n/gR.q', 'ADMIN', true),
  ('usr_gerente_borelli', 'Gerente da Gelateria', 'gerente@borelli.com.br', '$2a$10$VYcC11t6PyFJF9K8QQqLjOcZiPpOuaKZybCO7cmNHrFlOR8n/gR.q', 'MANAGER', true),
  ('usr_atendente_borelli', 'Atendente de Salão', 'atendente@borelli.com.br', '$2a$10$VYcC11t6PyFJF9K8QQqLjOcZiPpOuaKZybCO7cmNHrFlOR8n/gR.q', 'ATTENDANT', true),
  ('usr_admin_loja', 'Administrador Geral', 'admin@loja.com', '$2a$10$VYcC11t6PyFJF9K8QQqLjOcZiPpOuaKZybCO7cmNHrFlOR8n/gR.q', 'ADMIN', true)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "StoreConfig" ("id", "storeName", "logoUrl", "description", "welcomeMessage", "subtitleMessage", "thankYouPositive", "thankYouNegative", "slaHours", "phone", "email", "address", "businessHours")
VALUES (
  'default',
  'Gelato Borelli',
  '/logo-borelli.png',
  'O verdadeiro gelato tradicional italiano',
  'Como foi sua experiência na Gelato Borelli hoje?',
  'Sua opinião é fundamental para aprimorarmos continuamente nosso atendimento.',
  'Grazie mille! Agradecemos imensamente o seu carinho e esperamos recebê-lo novamente em breve.',
  'Sentimos muito pelo ocorrido. Nossa gerência foi imediatamente notificada e entraremos em contato para solucionar.',
  24,
  '(16) 3620-1122',
  'sac@gelatoborelli.com.br',
  'Ribeirão Preto, SP',
  'Todos os dias das 11h00 às 23h00'
)
ON CONFLICT ("id") DO NOTHING;

-- MESAS INICIAIS DA LOJA (1 A 10)
INSERT INTO "Table" ("id", "number", "name", "slug", "token", "active")
VALUES
  ('tbl_1', 1, 'Mesa 01', 'mesa-01', 'tok_mesa_01_borelli', true),
  ('tbl_2', 2, 'Mesa 02', 'mesa-02', 'tok_mesa_02_borelli', true),
  ('tbl_3', 3, 'Mesa 03', 'mesa-03', 'tok_mesa_03_borelli', true),
  ('tbl_4', 4, 'Mesa 04', 'mesa-04', 'tok_mesa_04_borelli', true),
  ('tbl_5', 5, 'Mesa 05', 'mesa-05', 'tok_mesa_05_borelli', true),
  ('tbl_6', 6, 'Mesa 06', 'mesa-06', 'tok_mesa_06_borelli', true),
  ('tbl_7', 7, 'Mesa 07', 'mesa-07', 'tok_mesa_07_borelli', true),
  ('tbl_8', 8, 'Mesa 08', 'mesa-08', 'tok_mesa_08_borelli', true),
  ('tbl_9', 9, 'Mesa 09', 'mesa-09', 'tok_mesa_09_borelli', true),
  ('tbl_10', 10, 'Mesa 10', 'mesa-10', 'tok_mesa_10_borelli', true)
ON CONFLICT ("number") DO NOTHING;
