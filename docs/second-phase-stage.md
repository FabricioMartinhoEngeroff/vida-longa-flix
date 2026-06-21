  Fase 2 — Pendências (atualizado)                                     
                                                                       
  Itens da Fase 2 que ainda não foram implementados.
  O que já existe (CI com lint/test/build, Dependabot) foi removido    
  desta lista.                                                         

  ---
  Prioridade alta

  1) Upload de vídeo com S3 pre-signed URL

  Situação: não implementado.

  O que fazer:
  - Backend expõe endpoint que gera URL assinada temporária
  - Frontend envia vídeo direto ao S3 pelo navegador (sem trafegar pelo
   backend)
  - Backend salva metadados (título, categoria, duração) no PostgreSQL

  Impacto: reduz carga no backend e acelera uploads grandes.

  Pesquisar: AWS S3 Pre-Signed URL, AWS SDK v2 (Java)

  ---
  2) Paginação no catálogo (vídeos e cardápios)

  Situação: não implementado. Frontend carrega tudo de uma vez.

  O que fazer:
  - Backend: endpoints com limit/offset ou cursor
  - Frontend: scroll infinito ou botão "carregar mais"

  Impacto: evita respostas gigantes conforme conteúdo cresce.

  Pesquisar: paginação SQL (PostgreSQL), cursor-based pagination

  ---
  3) Cache Redis para leituras frequentes

  Situação: não implementado.

  O que fazer:
  - Redis para home, categorias, mais vistos
  - Invalidação automática ao criar/editar/deletar conteúdo no admin

  Impacto: home mais rápida, menos carga no banco.

  Pesquisar: ElastiCache Redis, Spring Cache + Redis

  ---
  Prioridade média

  4) Jobs assíncronos com fila

  Situação: não implementado.

  O que fazer:
  - Fila para tarefas pesadas: gerar thumbnails, processar watchTime,
  recalcular rankings
  - Backend consome mensagens da fila em background

  Impacto: requisições do usuário não travam por tarefas pesadas.

  Pesquisar: Amazon SQS, EventBridge, Spring Boot + listener SQS

  ---
  5) Métricas reais de produto

  Situação: não implementado.

  O que fazer:
  - Instrumentar eventos: video_start, video_progress_25/50/75/100,
  video_complete, favorite_added
  - Dashboard com dados reais de retenção e engajamento

  Impacto: decisões baseadas em dados reais, não suposições.

  Pesquisar: CloudWatch dashboards, PostgreSQL para agregados iniciais

  ---
  6) CI/CD — complementar segurança

  Situação: parcialmente feito. Já tem lint + test + build +
  Dependabot.

  O que falta:
  - Scan de segredos (Gitleaks)
  - SAST/code smells (SonarCloud ou Semgrep)
  - Scan de container/imagem (Trivy)
  - Gate obrigatório: bloquear merge se jobs falharem

  Impacto: protege produção contra vulnerabilidades e segredos vazados.

  Pesquisar: Gitleaks, SonarCloud, Semgrep, Trivy, GitHub branch
  protection rules

  ---
  Prioridade baixa (quando crescer)

  7) Separar serviço de mídia

  Facilita escalar upload/transcode independente da API principal.

  8) Recomendação personalizada

  Melhora retenção quando a base de usuários crescer.

  9) Estratégia multi-ambiente completa

  Deploy mais seguro com promoção: dev → staging → prod.

  ---
  Resumo por área
  ┌──────────┬─────────────────────────────────────────────────────┐
  │   Área   │                   Itens pendentes                   │
  ├──────────┼─────────────────────────────────────────────────────┤
  │ Backend  │ pre-signed URL, paginação, cache, fila, métricas    │
  ├──────────┼─────────────────────────────────────────────────────┤
  │ Frontend │ upload direto S3 (item 1), scroll infinito (item 2) │
  ├──────────┼─────────────────────────────────────────────────────┤
  │ Infra/CI │ Gitleaks, SonarCloud, Trivy, branch protection      │
  ├──────────┼─────────────────────────────────────────────────────┤
  │ Futuro   │ serviço de mídia, recomendação, multi-ambiente      │
  └──────────┴─────────────────────────────────────────────────────┘
