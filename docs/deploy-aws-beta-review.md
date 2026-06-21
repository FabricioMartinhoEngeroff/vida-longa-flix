# Deploy AWS (Beta) — Documento para revisão (Frontend + Backend)

> Documento separado para revisão antes de publicar no GitHub.

## Objetivo
Subir o **Vida Longa Flix** completo na AWS (frontend + backend) com baixo custo para fase beta (até ~100 assinaturas), permitindo cadastro/edição de vídeos e menu pela tela de **Admin**.

---

## Arquitetura recomendada (beta)
- **Frontend estático:** S3 + CloudFront
- **Backend API:** Elastic Beanstalk (single instance) **ou** ECS Fargate (1 task)
- **Banco relacional:** RDS PostgreSQL (`db.t4g.micro` ou `db.t4g.small`)
- **Armazenamento de vídeo/imagem:** S3 (bucket privado)
- **Segredos/config:** AWS Systems Manager Parameter Store ou Secrets Manager
- **Logs e monitoramento:** CloudWatch

---

## Fluxo funcional esperado (Admin)
1. Admin acessa frontend no CloudFront
2. Front chama API backend
3. Backend grava metadados no PostgreSQL (título, descrição, categoria, menu etc.)
4. Backend envia arquivo de vídeo/imagem ao S3
5. Front lista catálogo/menu já vindo da API

---

## Passo a passo — Frontend

### 1) Build do Angular
```bash
npm install
npm run build
```

### 2) Publicar no S3
1. Criar bucket (ex.: `vida-longa-flix-web-prod`)
2. Subir conteúdo de `dist/organo/browser` (ou `dist/...` conforme build)
3. Configurar acesso apenas via CloudFront (OAC recomendado)

### 3) CloudFront
1. Criar distribuição apontando para bucket do frontend
2. Configurar fallback SPA:
   - 403 -> `/index.html` com status 200
   - 404 -> `/index.html` com status 200

### 4) Domínio e HTTPS
- Associar domínio (Route 53, se usar)
- Certificado TLS no ACM
- Vincular certificado à distribuição CloudFront

### 5) Environment do Angular
Definir URL da API no build de produção:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.seu-dominio.com',
};
```

---

## Passo a passo — Backend

> Abaixo está o caminho mais simples para beta: **deploy contínuo em Elastic Beanstalk**.

### 1) Preparar banco PostgreSQL (RDS)
1. Criar RDS PostgreSQL (beta: `db.t4g.micro`, storage inicial pequeno)
2. Criar database (ex.: `vidalongaflix`)
3. Criar usuário/senha fortes
4. Liberar Security Group do RDS **somente** para SG do backend
5. Ativar backup automático

### 2) Preparar bucket S3 de mídia
1. Criar bucket (ex.: `vida-longa-flix-media-prod`)
2. Bloquear acesso público (bucket privado)
3. Criar pastas/prefixos (`videos/`, `thumbs/`)
4. Configurar lifecycle (opcional) para reduzir custo

### 3) IAM para backend acessar S3
Criar role/policy para a aplicação backend com permissões mínimas:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject` (se houver remoção)
- `s3:ListBucket`

Escopo apenas no bucket de mídia do projeto.

### 4) Variáveis de ambiente do backend
Definir no ambiente de deploy (Beanstalk/ECS):
- `DB_HOST`
- `DB_PORT=5432`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `JWT_SECRET` (se usar autenticação JWT)
- `CORS_ALLOWED_ORIGINS=https://seu-front.cloudfront.net` (ou domínio final)

### 5) Deploy backend (opção recomendada: Elastic Beanstalk)
1. Criar app e environment single-instance (beta)
2. Subir artefato do backend (jar/zip/docker conforme projeto)
3. Associar role IAM da aplicação
4. Configurar health check endpoint (ex.: `/health`)
5. Validar status verde no Beanstalk + logs no CloudWatch

### 6) CORS e integração com frontend
No backend, liberar CORS para domínio do frontend CloudFront (e domínio custom quando existir).

### 7) Upload de vídeo pela tela Admin
Para fluxo estável de upload:
- backend recebe arquivo
- backend valida tipo/tamanho
- backend salva no S3
- backend grava metadados no PostgreSQL
- backend retorna URL/chave para o frontend

> Evolução recomendada (quando crescer): usar URL pré-assinada (pre-signed URL) para upload direto do navegador ao S3.

### 8) Banco e migrações
- Aplicar migrations no deploy (quando disponível no backend)
- Garantir índice para consultas de catálogo/menu
- Criar usuário admin inicial via script/seed

---

## Esteira de qualidade e segurança (valor real para o app)

## Objetivo da esteira
Evitar regressão, reduzir bugs em produção, detectar vulnerabilidades cedo e padronizar deploy.

### Pipeline sugerido por estágio

#### 1) Pull Request (rápido e obrigatório)
- Lint frontend e backend
- Testes unitários
- Build frontend/backend
- Scan de segredos (ex.: `gitleaks`)
- SAST/code smells (ex.: `SonarQube`/`SonarCloud`, `Semgrep`)

**Gate de merge:** só aprova merge se todos jobs críticos passarem.

#### 2) Branch principal (main)
- Tudo do PR +
- Scan de dependências (`npm audit`, `OWASP Dependency-Check`, SCA do GitHub)
- Build de artefato versionado
- Geração de SBOM (ex.: `syft`)

#### 3) Pré-produção / Produção
- Deploy automatizado
- Smoke test pós-deploy (`/health`, login admin, listagem de vídeos)
- Scan de imagem/container (ex.: `Trivy`)
- Aprovação manual antes de produção (para beta ainda é recomendado)

### Ferramentas práticas (custo baixo)
- **CI/CD:** GitHub Actions
- **Code quality:** SonarCloud (qualidade + code smells)
- **SAST:** Semgrep
- **Dependências vulneráveis:** Dependabot + `npm audit`
- **Container/IaC scan:** Trivy
- **Secrets scan:** Gitleaks

### KPIs mínimos de qualidade
- Cobertura de testes (meta inicial: 60%+ no backend crítico)
- Zero vulnerabilidade crítica em produção
- Tempo de pipeline PR < 10 min (para não travar time)
- Taxa de falha de deploy < 10%

---

## Estrutura de esteira para deploy (ambientes)

### Ambientes recomendados
- `dev`: integração contínua, mais flexível
- `staging`: espelho simplificado de produção
- `prod`: ambiente estável para usuários

### Estratégia de promoção
1. Merge em `main` gera artefatos imutáveis
2. Deploy automático em `staging`
3. Rodar smoke tests
4. Aprovação manual
5. Promover **mesmo artefato** para `prod`

### Rollback
- Manter versão N-1 pronta para rollback imediato
- Banco com migração reversível quando possível
- Backup e snapshot antes de mudanças estruturais

---

## Observabilidade mínima
- CloudWatch Logs para backend
- Alarmes (CPU, memória, status check, erro 5xx)
- Alarmes RDS (CPU, storage, conexões)
- Métricas de produto (`views`, `watchTime`) instrumentadas no backend/app
- Dashboard com erros de upload, tempo médio de resposta da API e taxa de sucesso de login admin

---

## Checklist rápido de go-live (Front + Back)
- [ ] Front build ok
- [ ] Front publicado no S3
- [ ] CloudFront com fallback SPA
- [ ] Backend publicado (Beanstalk/ECS)
- [ ] Backend conectado ao RDS
- [ ] Backend com acesso IAM ao bucket de mídia
- [ ] Endpoint de health respondendo 200
- [ ] CORS liberado para domínio do frontend
- [ ] API URL de produção configurada no frontend
- [ ] Upload via Admin funcionando (arquivo + metadados)
- [ ] HTTPS ativo (front e API)
- [ ] Backup automático no RDS
- [ ] Alarmes CloudWatch básicos
- [ ] Pipeline com lint/test/build/security obrigatório no PR
- [ ] Rollback documentado e testado

---

## Próximo passo sugerido
Depois que este doc for aprovado, siga para o documento de melhorias:

- `docs/plano-fase-2-melhorias.md`

Depois posso gerar também um **runbook operacional** com:
- comandos AWS CLI para criação dos recursos
- exemplo de workflow GitHub Actions (frontend + backend)
- template de smoke tests pós-deploy
