# Vida Longa Flix

> **Viva mais. Viva melhor. Assista com propósito.**

Plataforma de streaming de conteúdo focada em **saude e longevidade**, onde cada video e receita foi pensado para ajudar o usuario a atingir objetivos concretos de saude. Construida com **Angular 21** e deployada na **AWS (S3 + CloudFront)**.

| Emagrecimento | Ganho de Massa Muscular | Longevidade |
|:---:|:---:|:---:|
| Videos, receitas e cardapios para perda de peso saudavel | Conteudo focado em hipertrofia e nutricao esportiva | Habitos, alimentacao e rotinas para uma vida longa e saudavel |

---

## Tecnologias

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex&logoColor=white)
![Angular Material](https://img.shields.io/badge/Angular%20Material-21-757575?style=flat-square&logo=angular&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-S3%20%2B%20CloudFront-FF9900?style=flat-square&logo=amazonaws&logoColor=white)

---

## Funcionalidades

- **Catalogo de videos** com carrossel, busca por titulo/categoria e preview ao passar o mouse
- **Catalogo de receitas e cardapios** com informacoes nutricionais (proteina, carboidrato, gordura, fibra, calorias)
- **Sistema de favoritos** para videos, receitas, cardapios e podcasts
- **Comentarios** em videos e receitas
- **Historico de visualizacao** automatico por usuario
- **Painel administrativo** com CRUD de videos e receitas, upload de capas e importacao em massa via CSV
- **Autenticacao JWT** com login, registro, troca de senha e controle de acesso por roles (ROLE_ADMIN)
- **Interface bilingue** (Portugues + Ingles)
- **Design responsivo** otimizado para mobile e desktop

---

## Pre-requisitos

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 10
- [Angular CLI](https://angular.dev/tools/cli) >= 21

---

## Instalacao

```bash
# Clone o repositorio
git clone https://github.com/seu-usuario/vida-longa-flix.git

# Entre na pasta do projeto
cd vida-longa-flix

# Instale as dependencias
npm install
```

---

## Como executar

### Desenvolvimento

```bash
ng serve
```

A aplicacao estara disponivel em `http://localhost:4200`.

> O servidor de desenvolvimento utiliza um proxy que redireciona as chamadas `/api` para `http://localhost:8090`. Certifique-se de que o backend esteja rodando nessa porta.

### Build de producao

```bash
ng build
```

Os arquivos de saida serao gerados em `dist/organo/browser`.

---

## Testes

```bash
# Executar testes com Vitest
npx vitest

# Ou pelo Angular CLI
ng test
```

---

## Lint

```bash
ng lint
```

---

## Estrutura do projeto

```
src/
├── app/
│   ├── auth/              # Autenticacao (login, registro, guards, interceptors)
│   ├── features/          # Paginas principais
│   │   ├── home/          # Catalogo e grid de videos
│   │   ├── favorites/     # Favoritos do usuario
│   │   ├── most-viewed/   # Conteudos mais assistidos
│   │   ├── menus/         # Catalogo de receitas e cardapios
│   │   ├── video-admin/   # Painel admin de videos
│   │   ├── menu-admin/    # Painel admin de receitas
│   │   └── not-found/     # Pagina 404
│   └── shared/            # Componentes, servicos e tipos reutilizaveis
├── assets/                # Arquivos estaticos (JSON de dados)
├── environments/          # Configuracoes por ambiente (dev/prod)
└── styles/                # Estilos globais
```

---

## Deploy

O frontend e deployado como SPA na **AWS**:

- **S3** para hospedagem dos arquivos estaticos
- **CloudFront** como CDN com SSL/TLS
- **Route 53** para dominio customizado

Detalhes completos em [`deploy-aws-beta-review.md`](deploy-aws-beta-review.md).

---

## Documentacao

Documentacao tecnica detalhada esta disponivel na pasta [`docs/`](docs/):

- [`README-frontend.md`](docs/README-frontend.md) — Arquitetura, servicos e componentes do frontend
- [`EF-FRONTEND-PT.md`](docs/EF-FRONTEND-PT.md) — Especificacao funcional (PT)
- [`EF-FRONTEND-EN.md`](docs/EF-FRONTEND-EN.md) — Especificacao funcional (EN)
- [`sre-observability.md`](docs/sre-observability.md) — Observabilidade e monitoramento

---

## Contribuindo

1. Faca um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Faca commit das suas alteracoes (`git commit -m 'feat: adiciona minha feature'`)
4. Faca push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

### Padroes

- Utilize **standalone components** (sem NgModules)
- Siga o padrao de **Reactive Forms** para formularios
- Mantenha o **strict mode** do TypeScript
- Escreva testes para novos servicos e componentes
- Siga o [Conventional Commits](https://www.conventionalcommits.org/) para mensagens de commit

---

## Licenca

Este projeto esta sob a licenca MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Autor

Feito por **Fabricio** — [GitHub](https://github.com/seu-usuario)
