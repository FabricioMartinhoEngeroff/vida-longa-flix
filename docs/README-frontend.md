# VidaLong Flix — Frontend

> **Viva mais. Viva melhor. Assista com propósito.**

Plataforma de streaming de conteúdo focada em **saúde e longevidade** — onde cada vídeo e receita foi pensado para te ajudar a atingir um objetivo concreto.

### Objetivos suportados

| Emagrecimento | Ganho de Massa Muscular | Longevidade |
|:---:|:---:|:---:|
| Vídeos, receitas e cardápios para perda de peso saudável | Conteúdo focado em hipertrofia e nutrição esportiva | Hábitos, alimentação e rotinas para uma vida longa e saudável |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Angular 21.2.7 (standalone components) |
| Linguagem | TypeScript 5.9 — strict mode |
| Estado | Angular Signals + RxJS |
| Formulários | Reactive Forms |
| Ícones | Angular Material (MatIconModule) |
| Testes | Vitest 4.1 + Jasmine + jsdom |
| Build | Angular CLI 21.2.6 |
| Deploy | AWS S3 + CloudFront |

---

## Estrutura e Arquitetura

### Estado (State Management)

- **Angular Signals** como abordagem primária — `signal<T>()`, `computed()`, `.asReadonly()`
- **RxJS** para fluxos assíncronos — `BehaviorSubject`, `Observable`, `catchError`, `tap`, `of`
- Sem NgRx — arquitetura signal + services pura e direta
- `LocalStorage` para dados persistentes: tokens, histórico, notificações

### Roteamento & Guards

- Rotas protegidas com `canActivate`
- `authGuard` — redireciona para `/login` se não autenticado
- `adminGuard` — verifica `ROLE_ADMIN`, redireciona para `/app` se não autorizado
- Rotas bilíngues: `/favorites` + `/favoritos`
- Wildcard `**` → `NotFoundComponent` (404)

### HTTP & Segurança

- `authInterceptor` funcional (Angular 17+ style) — injeta `Authorization: Bearer` automaticamente
- Validação de token JWT (3 partes) antes de injetar
- Proteção contra token leakage — interceptor ativo apenas para `environment.apiUrl`
- `resolveUrl()` nos serviços — corrige URLs relativas cross-origin

---

## Formulários

- **Reactive Forms** com `FormBuilder`, `FormGroup`, `FormControl`
- Validators nativos: `required`, `email`, `minLength`, `pattern`
- Validator customizado: `strongPasswordValidator` com 5 níveis (`VERY_WEAK` → `VERY_STRONG`)
- Regex de senha: maiúscula + minúscula + número + caractere especial + mínimo 8 chars
- Detecção de e-mails temporários/suspeitos
- Máscaras de entrada: CPF, telefone
- Upload de arquivos via `multipart/FormData` nos formulários de admin

---

## Serviços

| Serviço | Responsabilidade |
|---|---|
| `VideoService` | CRUD de vídeos, signals, upload de capa |
| `MenuService` | CRUD de receitas e cardápios |
| `FavoritesService` | Favoritos por tipo: VIDEO, MENU, RECIPE, PODCAST |
| `CommentsService` | Comentários por vídeo |
| `ModalService` | Controla modal e registra visualização (`PATCH /videos/{id}/view`) |
| `CategoriesService` | Cria categoria automaticamente se não existir |
| `ContentNotificationsService` | Histórico persistente via LocalStorage (máx. 200 itens) |
| `NotificationService` | Toasts tipados: `success` (2s), `error`/`info` (4s) |
| `ViewHistoryService` | Histórico de vídeos assistidos por usuário |
| `LoggerService` | Interface de log — `warn`, `error`, `log` |

---

## Componentes

- **Catálogo** com agrupamento por categoria (`agrupar-por` utility)
- **Carousels** de categorias e conteúdo
- `VideoZoomModal` — player full-screen
- `MenuModal` — detalhe de receita
- `FavoriteButton` — toggle like com feedback visual
- `EngagementSummary` — views, likes, comentários
- `CommentsBox` — thread de comentários
- `ConfirmationModal` — confirmação antes de deletar
- Toasts: `Success`, `Error`, `Warning`, `Info`
- `PasswordStrengthIndicator` — barra visual de força da senha
- `UserProfileModal`, `ChangePasswordModal`, `UserMenu`
- `VideoAdminComponent`, `MenuAdminComponent` — painéis de administração
- `HomeComponent` — hover com preview (delay 2s), filtros por query params

---

## UX & Responsividade

- Detecção de mobile via `window.innerWidth <= 768`
- CSS scoped por componente — sem framework CSS externo
- Estilos globais separados: `buttons.css`, `global.css`, `auth/style.css`
- Proxy de desenvolvimento: `/api → http://localhost:8090`

---

## Observabilidade

- **OpenTelemetry** configurado em `tracing.ts`
- Pacotes: `@opentelemetry/sdk-trace-web`, `auto-instrumentations-web`, `exporter-trace-otlp-http`
- Aponta para Grafana Cloud — *fase 2, não ativo em produção ainda*

---

## Testes

```bash
# Rodar todos os testes
npx vitest

# Modo watch
npx vitest --watch
```

- **Vitest 4.1** como framework principal, com Jasmine e jsdom
- Specs em `*.service.spec.ts` para todos os serviços
- `agrupar-por.spec.ts` — utility testada isoladamente

---

## Build & Deploy

```bash
# Desenvolvimento
ng serve

# Build de produção
ng build --configuration production
```

- Angular CLI 21.2.6 com builder `@angular/build:application`
- File replacement automático: `environment.ts` → `environment.prod.ts`
- Output hashing em todos os assets
- Budget: 700 kB inicial / 1 MB máximo
- Deploy via **AWS S3 + CloudFront**

---

## Tipos TypeScript

Tipos separados por domínio em arquivos dedicados:

```text
src/
├── types/
│   ├── videos.ts
│   ├── menu.ts
│   ├── favorite.ts
│   ├── user.types.ts
│   └── form.types.ts
└── utils/
    ├── agrupar-por.ts
    ├── strong-password-validator.ts
    └── handle-api-error.ts
```

---

## Roadmap — Planejado / Não Implementado

> Itens abaixo estão definidos na arquitetura, mas ainda não implementados.

- [ ] `npm audit` integrado ao pipeline de CI
- [ ] SonarCloud SAST para TypeScript/Angular
- [ ] SRI (Subresource Integrity) em recursos CDN
- [ ] Angular OpenTelemetry ativo em produção (Passo 14)
- [ ] CORS backend: substituir `allowedHeaders("*")` por lista explícita
- [ ] JWT migrado para HttpOnly cookies (proteção anti-XSS)
- [ ] Interceptor Angular para CSRF token (fase 2)
- [ ] Verificação de produção: CORS + headers na resposta real

---

## Licença

Distribuído sob licença privada. Consulte o time responsável para mais informações.
