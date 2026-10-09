# 🍨 Gelato Borelli — Sistema de Avaliações, Reclamações & Ouvidoria

Sistema web full-stack completo, profissional e pronto para uso real na **Gelato Borelli**. Desenvolvido com identidade visual exclusiva (verde floresta artesanal `#1e3220`, creme suave `#fbf8f1`, detalhes tricolores italianos e logotipo oficial), transformando o feedback de clientes nas mesas via QR Code em excelência no atendimento, retenção e gestão da qualidade.

---

## 📋 Sumário
1. [Visão Geral da Arquitetura](#-visão-geral-da-arquitetura)
2. [Stack Tecnológica](#-stack-tecnológica)
3. [Segurança e Proteções Implementadas](#-segurança-e-proteções-implementadas)
4. [Área Pública do Cliente (QR Code)](#-área-pública-do-cliente-qr-code)
5. [Painel Administrativo Privado](#-painel-administrativo-privado)
6. [Instalação e Execução Local](#-instalação-e-execução-local)
7. [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
8. [Perfis de Acesso e Credenciais Iniciais](#-perfis-de-acesso-e-credenciais-iniciais)
9. [Testes Automatizados](#-testes-automatizados)
10. [Mesas, QR Codes e Impressão](#-mesas-qr-codes-e-impressão)
11. [Deploy em Produção (Docker & PostgreSQL)](#-deploy-em-produção-docker--postgresql)
12. [Rotinas de Backup e Restauração](#-rotinas-de-backup-e-restauração)
13. [LGPD e Privacidade](#-lgpd-e-privacidade)
14. [Responsabilidades do Estabelecimento e Limitações](#-responsabilidades-do-estabelecimento-e-limitações)

---

## 🏛️ Visão Geral da Arquitetura

O sistema é construído segundo os mais rigorosos padrões da indústria de software:
- **Separação estrita de domínios:** Área pública rápida e leve para smartphones de clientes; área privada corporativa para gerência e equipe.
- **Validação no Servidor:** Todas as operações (validação de mesa, notas, textos e formulários) passam por schemas rigorosos do **Zod** antes de atingir o banco.
- **Histórico e Auditoria Imutáveis:** Mudanças de status, atribuição de responsáveis e inclusão de observações geram eventos registrados no servidor.
- **Observações Internas Privadas:** Notas da equipe nunca são enviadas ao frontend público nem expostas em endpoints abertos.
- **Protocolos Imprevisíveis:** Cada avaliação/reclamação gera um identificador seguro (`PRT-2026-XXXXXX`) sem expor IDs sequenciais ou internos.

---

## 🛠️ Stack Tecnológica

- **Framework Web:** Next.js 14 (App Router)
- **Linguagem:** TypeScript com tipagem estrita
- **Frontend & Estilização:** React 18, Tailwind CSS, Lucide Icons
- **Gráficos:** Recharts
- **ORM & Banco de Dados:** Prisma ORM com suporte a SQLite (zero-configuração local) e PostgreSQL (produção corporativa / Docker)
- **Autenticação:** BcryptJS (hash de senhas), JOSE (JWT assinado com algoritmo HS256 em cookies HttpOnly e SameSite)
- **Validação de Schemas:** Zod
- **QR Codes:** Biblioteca nativa `qrcode` com geração de Data URLs, PNG buffer para download e cartões de mesa para impressão
- **Testes:** Vitest (unitários e integração com banco)

---

## 🛡️ Segurança e Proteções Implementadas

1. **Proteção contra SQL Injection:** Consultas 100% parametrizadas via Prisma ORM.
2. **Proteção contra CSV Formula Injection (CWE-1236):** Sanitização de células exportadas. Valores que iniciam com `=`, `+`, `-`, `@`, `\t` ou `\r` recebem prefixo `'` para impedir execução arbitrária de código no Excel/LibreOffice.
3. **Proteção contra XSS:** Sanitização e escape de tags HTML em todos os campos livres.
4. **Rate Limiting no Servidor:**
   - Login administrativo: máximo de 5 tentativas por minuto por IP.
   - Envio de feedbacks públicos: máximo de 10 envios por minuto por IP.
5. **Cookies HttpOnly e Secure:** Sessões administrativas protegidas contra leitura por scripts maliciosos.
6. **Controle de Acesso por Perfil (RBAC):**
   - **Administrador:** Acesso irrestrito a configurações, equipe, mesas, relatórios e auditoria.
   - **Gerente:** Acompanhamento de reclamações, alteração de status, observações internas e relatórios operacionais. Proibido alterar administradores e configurações críticas da loja.
   - **Atendente:** Visualização e registro de notas em ocorrências. Proibido gerenciar usuários, alterar configurações ou exportar dados.
7. **Cabeçalhos de Segurança:** Configurados no Middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`).

---

## 📱 Área Pública do Cliente (QR Code)

- **URL de Acesso:** `/avaliar?mesa=tb_m1_xxxx` (ou `/avaliar` para feedback avulso).
- **Validação de Mesa:** O servidor verifica se a mesa existe e se está ativa. Mesas inativas bloqueiam o envio com mensagem educada.
- **Fluxo Inteligente de Satisfação:**
  - **4 e 5 estrelas:** Interface de agradecimento rápido com campo opcional de elogio.
  - **1, 2 e 3 estrelas:** Mensagem acolhedora de acolhimento imediato, seleção de motivo (Atendimento, Demora, Pedido Incorreto, Qualidade, Limpeza, Ambiente, Pagamento, Outro), descrição detalhada e formulário de contato condicional.
- **Anonimato Garantido:** Se o cliente não solicitar retorno ativo, não é exigido nenhum dado pessoal (Nome, Telefone ou E-mail).
- **Tela de Confirmação:** Protocolo de atendimento gerado, botão para copiar e link para a Política de Privacidade.

---

## 💻 Painel Administrativo Privado

- **Rotas:**
  - `/admin/login` — Autenticação corporativa com rate limiting
  - `/admin` — Dashboard em tempo real com KPIs (Total, Média, % Positivas, % Negativas, Novas Reclamações, SLA Atrasadas) e gráficos interativos (Evolução 7 dias, Distribuição de Estrelas, Categorias, Status)
  - `/admin/avaliacoes` — Tabela com paginação no servidor, filtros por nota, mesa, período, comentários e busca textual
  - `/admin/reclamacoes` — Área de atendimento com badges visuais, SLA e filtros de responsáveis
  - `/admin/reclamacoes/[id]` — Detalhes completos, alteração de status, atribuição, notas internas privadas e linha do tempo cronológica imutável
  - `/admin/mesas` — Cadastro, edição, ativação/desativação, download de PNG e impressão em lote de cartões de mesa
  - `/admin/relatorios` — Métricas avançadas, horários de pico, mesas mais reclamadas e exportação em CSV seguro
  - `/admin/usuarios` — Gestão de colaboradores (Admin, Gerente, Atendente)
  - `/admin/configuracoes` — Personalização da loja, textos, contatos e limites de SLA em horas

---

## 🚀 Instalação e Execução Local

### Pré-requisitos
- Node.js versão 20 LTS ou superior
- NPM ou Yarn

### Passo a Passo

1. **Clone ou navegue até o diretório do projeto:**
   ```bash
   cd feedback-loja
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Inicialize o Banco de Dados:**
   ```bash
   npx prisma db push
   ```

5. **Execute o Seed para criar o primeiro administrador e dados de exemplo:**
   ```bash
   node scripts/seed.mjs
   ```

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação em [http://localhost:3000](http://localhost:3000).

---

## 🔑 Perfis de Acesso e Credenciais Iniciais

O script `scripts/seed.mjs` cria automaticamente 3 perfis para teste de permissões:

| Perfil | E-mail | Senha Padrão | Permissões |
|---|---|---|---|
| **Administrador** | `admin@loja.com` | `Admin@Seguro123` | Acesso total ao sistema, configurações e equipe |
| **Gerente** | `gerente@loja.com` | `Gerente@123` | Atendimento, status, notas internas e exportação |
| **Atendente** | `atendente@loja.com` | `Atendente@123` | Visualização de ocorrências e notas de atendimento |

> ⚠️ **Importante para Produção:** Altere a senha do usuário administrador imediatamente após o primeiro login ou defina a variável `ADMIN_INITIAL_PASSWORD` antes do seed.

---

## 🧪 Testes Automatizados

O sistema conta com 24 testes automatizados cobrindo segurança, integridade, validações e persistência:

```bash
npm test
```

### O que é testado:
- ✅ **Segurança:** Sanitização contra injeção de fórmulas em CSV (`=`, `+`, `-`, `@`) e escaping XSS.
- ✅ **LGPD:** Mascaramento de dados sensíveis em relatórios públicos.
- ✅ **Protocolos:** Imprevisibilidade e unicidade dos protocolos gerados.
- ✅ **Validações Zod:** Bloqueio de notas inválidas, obrigatoriedade de meio de contato se solicitar retorno, limites de caracteres.
- ✅ **RBAC:** Garantia de que Atendente e Gerente não conseguem executar ações restritas do Administrador.
- ✅ **Banco de Dados:** Criação atômica de avaliações, reclamações, observações privadas e linha do tempo de histórico.

---

## 🖨️ Mesas, QR Codes e Impressão

1. Acesse o painel em `/admin/mesas`.
2. Cadastre as mesas do salão (Ex: "Mesa 01 - Salão", "Mesa 02 - Varanda").
3. Para cada mesa, você pode:
   - **Copiar o link público** de avaliação.
   - **Baixar o QR Code em PNG** de alta resolução.
   - **Imprimir o cartão individual** da mesa.
4. **Impressão em Lote:** Clique em **"Imprimir Várias Mesas"** para gerar uma folha de placas de mesa com corte pontilhado pronta para impressão em papel cartão ou acrílico.

---

## 🐳 Deploy em Produção (Docker & PostgreSQL)

O projeto inclui `Dockerfile` multi-stage otimizado e `docker-compose.yml` pré-configurado com PostgreSQL:

1. **Altere as variáveis no `docker-compose.yml`:**
   - `JWT_SECRET`: Insira uma chave aleatória com mais de 32 caracteres.
   - `NEXT_PUBLIC_APP_URL`: Insira o domínio oficial com HTTPS (Ex: `https://feedback.sualoja.com.br`).
   - Senhas seguras para o PostgreSQL.

2. **Inicie os containers:**
   ```bash
   docker compose up -d --build
   ```

3. **Gere o banco e execute o seed no container:**
   ```bash
   docker compose exec app npx prisma db push --schema=prisma/schema.postgresql.prisma
   docker compose exec app node scripts/seed.mjs
   ```

---

## 💾 Rotinas de Backup e Restauração

### Backup no PostgreSQL (Produção)
```bash
# Gerar dump compactado
docker compose exec -t postgres pg_dump -U feedback_admin feedback_loja > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restauração do Banco
```bash
cat backup_arquivo.sql | docker compose exec -T postgres psql -U feedback_admin -d feedback_loja
```

### Backup no SQLite (Desenvolvimento/Local)
Basta copiar o arquivo `prisma/dev.db` para um local de armazenamento seguro ou nuvem.

---

## ⚖️ LGPD e Privacidade

O sistema adota os princípios fundamentais da LGPD (Lei nº 13.709/2018):
- **Coleta Mínima:** Feedbacks podem ser enviados anonimamente sem cadastro ou CPF.
- **Finalidade Específica:** Dados de contato (WhatsApp/E-mail) são coletados exclusivamente para resolução da reclamação quando solicitado pelo cliente.
- **Página de Política Integrada:** Acessível em `/politica-de-privacidade`.
- **Proteção nos Logs:** Redação e hash de endereços IP.

---

## ⚠️ Responsabilidades do Estabelecimento e Limitações

1. **Configuração de HTTPS:** Em ambiente de produção, configure um certificado SSL/TLS válido (Let's Encrypt / Cloudflare) para garantir a integridade dos cookies HttpOnly Secure.
2. **Revisão Institucional:** Edite os dados do estabelecimento em `/admin/configuracoes` (Nome, Endereço, CNPJ e DPO de contato).
3. **Notificações Externas:** A arquitetura está pronta e modelada para integrações com Webhooks, WhatsApp API (Z-API/Evolution) ou provedores de E-mail (Resend/SendGrid). A primeira versão armazena e notifica diretamente no painel administrativo em tempo real.
