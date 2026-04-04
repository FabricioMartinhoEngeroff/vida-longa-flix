# VidaLongaFlix - Especificacao Funcional do Sistema Frontend

## 1. Historico de Revisoes

| Data       | Resumo da Revisao                              | Responsavel | Previsao de Desenvolvimento |
|------------|------------------------------------------------|-------------|------------------------------|
| 01/03/2026 | Criacao do documento inicial                   | Fabricio    | -                            |

---

## 2. Visao Geral do Sistema

O VidaLongaFlix e uma plataforma de streaming de videos e cardapios voltada para saude e longevidade. O frontend e uma Single Page Application (SPA) que permite aos usuarios autenticados assistir videos, curtir conteudos, comentar, gerenciar favoritos e receber notificacoes. Administradores gerenciam conteudo diretamente pela interface, incluindo exclusao nas paginas publicas.

**Tecnologias:** Angular 21, TypeScript, Angular Signals, Reactive Forms, Angular Material Icons, Vitest.

**Arquitetura:** 100% Standalone Components (sem NgModules), gerenciamento de estado via Signals.

**URL base da API (desenvolvimento):** `/api` (proxy para `http://localhost:8090`)

**URL base da API (producao):** `https://api.vidalongaflix.com.br/api`

---

## 3. Perfis de Acesso

| Perfil       | Descricao                                                                 |
|--------------|---------------------------------------------------------------------------|
| ROLE_USER    | Usuario autenticado com acesso ao conteudo (videos, cardapios, favoritos) |
| ROLE_ADMIN   | Administrador com acesso total, incluindo CRUD de conteudo e exclusao nas paginas publicas |
| Nao autenticado | Redirecionado para a tela de login/cadastro                          |

---

## 4. Regras Gerais

**RG01** - A autenticacao utiliza JWT (JSON Web Token). O token e armazenado em `localStorage` (sessao persistente) ou `sessionStorage` (sessao temporaria), conforme escolha do usuario no login.

**RG02** - Apenas um tipo de storage e usado por sessao. Se o usuario marca "manter conectado", usa `localStorage`; caso contrario, usa `sessionStorage`.

**RG03** - O interceptor HTTP adiciona o header `Authorization: Bearer {token}` automaticamente em todas as requisicoes para a API. Tokens invalidos (formato diferente de 3 partes separadas por ponto) nao sao enviados.

**RG04** - Rotas protegidas por `authGuard` exigem autenticacao. Rotas admin sao protegidas por `authGuard` + `adminGuard`.

**RG05** - Usuarios nao autenticados sao redirecionados para `/login`. Usuarios sem perfil admin sao redirecionados para `/app` ao tentar acessar rotas admin.

**RG06** - Senhas devem conter no minimo 8 caracteres, incluindo: letra maiuscula, letra minuscula, numero e caractere especial. Um indicador visual de forca e exibido em tempo real.

**RG07** - Todos os textos da interface sao em portugues (PT-BR).

**RG08** - O sistema e responsivo com breakpoint em 768px (mobile/desktop).

**RG09** - Campos de formulario com mascara (CPF, telefone, CEP) formatam automaticamente a entrada do usuario e removem a mascara antes de enviar ao backend.

**RG10** - Comparacoes de texto (categorias, busca) sao normalizadas: trim, lowercase, remocao de acentos (NFD).

---

## 5. Estrutura de Rotas

### 5.1 Rotas Publicas (sem autenticacao)

| Rota                | Componente               | Descricao                    |
|---------------------|--------------------------|------------------------------|
| `/`                 | Redirect                 | Redireciona para `/authorization` |
| `/authorization`    | AuthorizationComponent   | Tela de login/cadastro       |
| `/login`            | LoginComponent           | Tela de login                |
| `/register`         | RegisterComponent        | Tela de cadastro             |
| `/password-change`  | PasswordChangeComponent  | Redefinicao de senha         |
| `/autorizacao`      | AuthorizationComponent   | Alias PT-BR                  |
| `/registrar`        | RegisterComponent        | Alias PT-BR                  |
| `/redefinir-senha`  | PasswordChangeComponent  | Alias PT-BR                  |
| `**`                | NotFoundComponent        | Pagina 404                   |

### 5.2 Rotas Autenticadas (authGuard)

| Rota                | Componente           | Descricao                      |
|---------------------|----------------------|--------------------------------|
| `/app`              | BasePageComponent    | Layout principal (container)   |
| `/app/` (index)     | HomeComponent        | Feed de videos por categoria   |
| `/app/favorites`    | FavoritesComponent   | Favoritos do usuario           |
| `/app/favoritos`    | FavoritesComponent   | Alias PT-BR                    |
| `/app/most-viewed`  | MostViewedComponent  | Videos mais assistidos         |
| `/app/mais-vistos`  | MostViewedComponent  | Alias PT-BR                    |
| `/app/history`      | HomeComponent        | Historico de visualizacao      |
| `/app/historico`    | HomeComponent        | Alias PT-BR                    |
| `/app/menus`        | MenusComponent       | Cardapios por categoria        |
| `/app/cardapios`    | MenusComponent       | Alias PT-BR                    |

### 5.3 Rotas Admin (authGuard + adminGuard)

| Rota                | Componente           | Descricao                      |
|---------------------|----------------------|--------------------------------|
| `/app/video-admin`  | VideoAdminComponent  | Gerenciamento de videos        |
| `/app/menu-admin`   | MenuAdminComponent   | Gerenciamento de cardapios     |

---

## 6. Modulo de Autenticacao

### 6.1 Login

**Componente:** `LoginComponent`

**Rota:** `/login`

**Descricao:** Autentica o usuario com e-mail e senha. Apos login bem-sucedido, redireciona para `/app`.

**Campos do formulario:**

| Campo        | Tipo     | Obrigatorio | Validacao                |
|--------------|----------|-------------|--------------------------|
| email        | email    | Sim         | Formato de e-mail valido |
| password     | password | Sim         | Minimo 6 caracteres      |
| keepLoggedIn | checkbox | Nao         | -                        |

**Regras:**

**RG-LOGIN-01** - O e-mail e normalizado (trim + lowercase) antes do envio.

**RG-LOGIN-02** - Se "manter conectado" estiver marcado, token e dados do usuario sao salvos em `localStorage`. Caso contrario, em `sessionStorage`.

**RG-LOGIN-03** - Em caso de erro, uma mensagem de alerta e exibida via NotificationService.

**Endpoint chamado:** `POST /api/auth/login`

---

### 6.2 Cadastro

**Componente:** `RegisterComponent`

**Rota:** `/register`

**Descricao:** Cadastra novo usuario. Apos cadastro, inicia sessao automaticamente e redireciona para `/app`.

**Campos do formulario:**

| Campo    | Tipo     | Obrigatorio | Validacao                                                        |
|----------|----------|-------------|------------------------------------------------------------------|
| name     | text     | Sim         | Minimo 3 caracteres                                              |
| email    | email    | Sim         | Formato valido, rejeita dominios temporarios e suspeitos          |
| phone    | tel      | Sim         | 10 ou 11 digitos, mascara automatica (XX) XXXXX-XXXX             |
| password | password | Sim         | Minimo 8 caracteres, forca minima STRONG (maiuscula, minuscula, numero, especial) |

**Regras:**

**RG-REG-01** - E-mails de dominios temporarios (ex: guerrillamail, tempmail) sao rejeitados com mensagem especifica.

**RG-REG-02** - E-mails suspeitos (padroes estranhos) recebem aviso visual via `EmailAdjustmentMessageComponent`.

**RG-REG-03** - A forca da senha e exibida em tempo real pelo `PasswordStrengthIndicatorComponent` com barra colorida e lista de requisitos faltantes.

**RG-REG-04** - O telefone e formatado com mascara automatica e normalizado antes do envio.

**Endpoint chamado:** `POST /api/auth/register`

---

### 6.3 Recuperacao de Senha

**Componente:** `PasswordRecoveryComponent` (modal dentro do LoginComponent)

**Descricao:** Envia e-mail de recuperacao de senha.

**Campos:**

| Campo | Tipo  | Obrigatorio | Validacao                |
|-------|-------|-------------|--------------------------|
| email | email | Sim         | Formato de e-mail valido |

**Endpoint chamado:** `POST /api/auth/password-recovery`

---

### 6.4 Redefinicao de Senha

**Componente:** `PasswordChangeComponent`

**Rota:** `/password-change`

**Descricao:** Permite redefinir a senha usando token enviado por e-mail.

**Campos:**

| Campo           | Tipo     | Obrigatorio | Validacao                                     |
|-----------------|----------|-------------|-----------------------------------------------|
| newPassword     | password | Sim         | Minimo 8 caracteres, forca minima STRONG       |
| confirmPassword | password | Sim         | Deve ser igual a newPassword                   |

**Regras:**

**RG-PWD-01** - O token e validado ao carregar a pagina. Tokens invalidos exibem mensagem de erro.

**RG-PWD-02** - As senhas devem ser identicas. Caso contrario, exibe "As senhas nao coincidem".

---

### 6.5 Sessao do Usuario Autenticado

**Servico:** `AuthService`

**Descricao:** Gerencia o estado de autenticacao da aplicacao.

**Endpoints chamados:**

| Metodo                    | Endpoint                    | Descricao                        |
|---------------------------|-----------------------------|----------------------------------|
| `login()`                 | `POST /api/auth/login`      | Autenticar usuario               |
| `register()`              | `POST /api/auth/register`   | Cadastrar usuario                |
| `fetchAuthenticatedUser()`| `GET /api/users/me`         | Recuperar dados do usuario logado|
| `logout()`                | Nenhum (local)              | Limpa storage, redireciona       |

**Observables/Estado:**

| Propriedade | Tipo                         | Descricao                          |
|-------------|------------------------------|------------------------------------|
| `user$`     | `Observable<User \| null>`   | Observable do usuario autenticado  |
| `user`      | `User \| null`               | Getter sincrono do usuario         |

---

### 6.6 Interceptor HTTP

**Arquivo:** `auth.interceptor.ts`

**Descricao:** Interceptor funcional que adiciona o header de autorizacao.

**Regras:**

**RG-INT-01** - Somente adiciona o header em requisicoes para a URL base da API (`environment.apiUrl`).

**RG-INT-02** - Valida formato JWT (3 partes separadas por ponto). Tokens invalidos, vazios, "null" ou "undefined" nao sao enviados.

---

### 6.7 Guards

**authGuard:**
- Verifica `authService.isAuthenticated()` (existencia do token)
- Redireciona para `/login` se nao autenticado

**adminGuard:**
- Verifica se o usuario possui `ROLE_ADMIN` no array `roles`
- Redireciona para `/authorization` se nao ha usuario
- Redireciona para `/app` se nao e admin

---

## 7. Layout Principal

### 7.1 Base Page (Container)

**Componente:** `BasePageComponent`

**Rota:** `/app`

**Descricao:** Container principal que envolve todas as paginas autenticadas.

**Composicao:**

| Componente               | Posicao   | Descricao                              |
|--------------------------|-----------|----------------------------------------|
| `HeaderComponent`        | Topo      | Barra superior com busca e menu        |
| `NavbarComponent`        | Lateral   | Menu de navegacao                      |
| `RouterOutlet`           | Centro    | Conteudo da pagina ativa               |
| `FooterComponent`        | Rodape    | Rodape da aplicacao                    |
| `VideoZoomModalComponent`| Overlay   | Modal global de video                  |

---

### 7.2 Header

**Componente:** `HeaderComponent`

**Descricao:** Barra superior com campo de busca, menu do usuario e notificacoes.

**Composicao:**

| Componente               | Descricao                                      |
|--------------------------|-------------------------------------------------|
| `SearchFieldComponent`   | Campo de pesquisa com autocomplete               |
| `UserMenuComponent`      | Menu dropdown do usuario (foto, perfil, logout)  |
| `NotificationsComponent` | Sino de notificacoes com badge de nao-lidas      |

**Funcionalidade de Busca:**

**RG-BUSCA-01** - Indexa todos os videos e cardapios carregados na memoria.

**RG-BUSCA-02** - Remove stop words em portugues e normaliza acentos.

**RG-BUSCA-03** - Resultados sao ranqueados por relevancia (correspondencia de tokens).

**RG-BUSCA-04** - Ao selecionar um resultado, navega para a pagina correspondente com query params (`tipo`, `id`, `cat`, `q`) e faz scroll automatico ate o item.

---

### 7.3 Navbar

**Componente:** `NavbarComponent`

**Descricao:** Menu de navegacao lateral.

**Itens de Menu:**

| Item              | Icone         | Rota               | Admin Only |
|-------------------|---------------|---------------------|------------|
| Inicio            | home          | /app                | Nao        |
| Cardapios         | restaurant    | /app/menus          | Nao        |
| Favoritos         | favorite      | /app/favorites      | Nao        |
| Historico         | history       | /app/history        | Nao        |
| Mais vistos       | trending_up   | /app/most-viewed    | Nao        |
| Reels             | movie         | /app                | Nao        |
| Adicionar videos  | video_call    | /app/video-admin    | Sim        |
| Admin Cardapios   | restaurant_menu| /app/menu-admin    | Sim        |

**Regras:**

**RG-NAV-01** - Itens marcados como `adminOnly` so sao exibidos quando o usuario possui `ROLE_ADMIN`.

**RG-NAV-02** - O item ativo e destacado com base na rota atual.

---

### 7.4 Menu do Usuario

**Componente:** `UserMenuComponent`

**Descricao:** Dropdown com foto, nome e acoes do usuario.

**Funcionalidades:**

| Acao               | Descricao                                                |
|--------------------|----------------------------------------------------------|
| Alterar foto       | Seletor de arquivo ou drag-and-drop (max 2MB, apenas imagem) |
| Editar perfil      | Abre `UserProfileModalComponent`                         |
| Alterar senha      | Abre `ChangePasswordModalComponent`                      |
| Sair               | Abre modal de confirmacao, chama `authService.logout()`   |

---

### 7.5 Perfil do Usuario

**Componente:** `UserProfileModalComponent`

**Descricao:** Modal para edicao do perfil do usuario.

**Campos do formulario:**

| Campo         | Tipo  | Obrigatorio | Mascara  | Validacao            |
|---------------|-------|-------------|----------|----------------------|
| name          | text  | Sim         | -        | Minimo 3 caracteres  |
| email         | email | Sim         | -        | Formato valido       |
| taxId         | text  | Nao         | CPF      | Minimo 11 digitos    |
| phone         | tel   | Nao         | Telefone | -                    |
| address.street| text  | Nao         | -        | -                    |
| address.number| text  | Nao         | -        | -                    |
| address.neighborhood | text | Nao   | -        | -                    |
| address.city  | text  | Nao         | -        | -                    |
| address.state | text  | Nao         | -        | -                    |
| address.zipCode | text | Nao       | CEP      | -                    |

---

### 7.6 Notificacoes

**Componente:** `NotificationsComponent`

**Descricao:** Dropdown de notificacoes de novos conteudos (videos e cardapios).

**Funcionalidades:**

| Funcionalidade       | Descricao                                            |
|----------------------|------------------------------------------------------|
| Badge de nao-lidas   | Contador exibido sobre o icone do sino                |
| Filtro por abas      | Todas / Nao lidas / Lidas                             |
| Paginacao            | 10 itens por pagina, botao "Carregar mais"            |
| Marcar todas como lidas | Botao para limpar todas as notificacoes            |
| Clicar em notificacao | Marca como lida e navega para o conteudo             |

**Armazenamento:** `localStorage` com chave `vlflix:content-notifications:v1` (maximo 200 itens).

**Regras:**

**RG-NOT-01** - Notificacoes sao geradas localmente quando um video ou cardapio e criado pelo admin.

**RG-NOT-02** - Data e hora sao formatadas no locale `pt-BR`.

---

## 8. Modulo de Videos (Home)

### 8.1 Feed de Videos

**Componente:** `HomeComponent`

**Rota:** `/app`

**Descricao:** Pagina principal que exibe todos os videos agrupados por categoria em carrosseis horizontais.

**Estrutura Visual:**

```
[Categoria 1 - Carrossel horizontal]
  [Card Video] [Card Video] [Card Video] ...

[Categoria 2 - Carrossel horizontal]
  [Card Video] [Card Video] [Card Video] ...
```

**Card de Video:**

| Elemento          | Descricao                                        |
|-------------------|--------------------------------------------------|
| Thumbnail         | Imagem de capa do video                          |
| Play overlay      | Icone de play sobre a capa                       |
| Video preview     | Preview automatico apos 2s de hover (desktop)    |
| Titulo            | Nome do video                                    |
| Descricao         | Texto descritivo (truncado em mobile)            |
| Curtidas          | Contador + botao de curtir                       |
| Comentarios       | Contador + botao para abrir modal                |
| Lixeira (admin)   | Botao de exclusao (visivel so para ROLE_ADMIN)   |

**Regras:**

**RG-HOME-01** - Videos sao carregados via `VideoService.videos()` (signal reativo). A lista e atualizada automaticamente quando o signal muda.

**RG-HOME-02** - Videos sao agrupados por `category.name` usando a funcao utilitaria `agruparPor()`.

**RG-HOME-03** - Em desktop, ao manter o mouse sobre um card por 2 segundos, o video comeca a tocar como preview (mudo, em loop).

**RG-HOME-04** - Em mobile (< 768px), o preview de video e desabilitado.

**RG-HOME-05** - Clicar no card abre o modal de video em tela cheia (`VideoZoomModalComponent`) via `ModalService`.

**RG-HOME-06** - Query params de busca (`tipo=video&id=xxx` ou `q=termo`) fazem scroll automatico ate o item correspondente.

---

### 8.2 Exclusao de Video (Admin na pagina publica)

**Descricao:** Administradores veem um botao de lixeira em cada card de video.

**Fluxo:**

1. Admin clica na lixeira no card do video
2. Modal de confirmacao abre: "Deseja mesmo deletar o video '{titulo}'?"
3. Confirma → chama `VideoService.removeVideo(id)` → toast de sucesso → lista atualiza automaticamente
4. Cancela → fecha modal, nada acontece

**Endpoint chamado:** `DELETE /api/admin/videos/{id}`

**Regras:**

**RG-DEL-VID-01** - O botao de lixeira so e exibido quando `isAdmin === true` (verificado via `AuthService.user$`).

**RG-DEL-VID-02** - O clique na lixeira usa `$event.stopPropagation()` para nao abrir o modal de video.

---

### 8.3 Modal de Video

**Componente:** `VideoZoomModalComponent`

**Descricao:** Modal em tela cheia para assistir video, curtir e comentar.

**Funcionalidades:**

| Funcionalidade   | Descricao                                          |
|------------------|------------------------------------------------------|
| Player de video  | Reproduz o video selecionado                         |
| Curtir           | Toggle favorito via `VideoService.toggleFavorite()`  |
| Comentarios      | Lista de comentarios com formulario de envio         |
| Excluir comentario (admin) | Lixeira em cada comentario (so admin)       |
| Fechar           | Botao X ou tecla ESC ou botao voltar do navegador    |

**Regras:**

**RG-MODAL-VID-01** - Ao abrir o modal, uma visualizacao e registrada via `PATCH /api/videos/{id}/view`.

**RG-MODAL-VID-02** - Comentarios sao carregados via `GET /api/comments/video/{videoId}`.

**RG-MODAL-VID-03** - Novos comentarios sao enviados via `POST /api/comments`.

**RG-MODAL-VID-04** - Exclusao de comentarios (admin) via `DELETE /api/comments/{commentId}`.

**RG-MODAL-VID-05** - O modal utiliza `window.history.pushState()` para permitir fechar com o botao voltar do navegador.

---

## 9. Modulo de Cardapios (Menus)

### 9.1 Feed de Cardapios

**Componente:** `MenusComponent`

**Rota:** `/app/menus`

**Descricao:** Exibe todos os cardapios agrupados por categoria em carrosseis horizontais.

**Card de Cardapio:**

| Elemento          | Descricao                                        |
|-------------------|--------------------------------------------------|
| Imagem de capa    | Foto do prato                                    |
| Titulo            | Nome do cardapio                                 |
| Categoria         | Nome da categoria (tag verde)                    |
| Descricao         | Texto descritivo (truncado em 2 linhas)          |
| Curtidas          | Contador + botao de curtir                       |
| Comentarios       | Contador + botao para abrir modal                |
| Lixeira (admin)   | Botao de exclusao (visivel so para ROLE_ADMIN)   |

**Regras:**

**RG-MENU-01** - Cardapios sao carregados via `MenuService.menus()` (signal reativo).

**RG-MENU-02** - Agrupados por `category.name` via `agruparPor()`.

**RG-MENU-03** - Clicar no card abre o modal de cardapio (`MenuModalComponent`).

**RG-MENU-04** - Query params de busca funcionam igual ao Home.

---

### 9.2 Exclusao de Cardapio (Admin na pagina publica)

**Fluxo:** Identico a exclusao de video (Secao 8.2).

**Endpoint chamado:** `DELETE /api/admin/menus/{id}`

---

### 9.3 Modal de Cardapio

**Componente:** `MenuModalComponent`

**Descricao:** Modal com detalhes completos do cardapio.

**Secoes exibidas:**

| Secao                    | Descricao                                |
|--------------------------|------------------------------------------|
| Imagem de capa           | Foto ampliada do prato                   |
| Titulo e descricao       | Nome e descricao completa                |
| Receita                  | Texto da receita (ou "Sem receita cadastrada") |
| Dicas da Nutri           | Dicas do nutricionista (ou "Sem dicas cadastradas") |
| Informacoes Nutricionais | Proteinas, carboidratos, gorduras, fibras, calorias |
| Comentarios              | Lista com formulario de envio            |
| Excluir comentario (admin) | Lixeira em cada comentario (so admin) |

**Inputs:**

| Input               | Tipo       | Descricao                     |
|---------------------|------------|-------------------------------|
| `menu`              | Menu       | Cardapio a exibir             |
| `comments`          | string[]   | Lista de comentarios          |
| `canDeleteComments` | boolean    | Habilita botao de excluir     |

**Outputs:**

| Output          | Tipo   | Descricao                    |
|-----------------|--------|------------------------------|
| `close`         | void   | Fechar modal                 |
| `favorite`      | void   | Toggle favorito              |
| `comment`       | string | Novo comentario              |
| `commentDelete` | string | Comentario a excluir         |

---

## 10. Modulo de Favoritos

**Componente:** `FavoritesComponent`

**Rota:** `/app/favorites`

**Descricao:** Exibe videos e cardapios favoritados pelo usuario, agrupados por categoria.

**Estrutura Visual:**

```
[Secao: Videos Favoritos]
  [Carrossel por categoria]

[Secao: Cardapios Favoritos]
  [Carrossel por categoria]
```

**Regras:**

**RG-FAV-01** - Favoritos sao carregados via `FavoritesService.load()` ao entrar na pagina.

**RG-FAV-02** - A lista e filtrada cruzando os IDs de favoritos com os dados completos de `VideoService` e `MenuService`.

**RG-FAV-03** - Desfavoritar um item remove-o da lista em tempo real.

**Endpoints chamados:**

| Metodo               | Endpoint                           | Descricao              |
|----------------------|------------------------------------|------------------------|
| Carregar favoritos   | `GET /api/favorites`               | Lista todos os favoritos |
| Toggle favorito      | `POST /api/favorites/{type}/{id}`  | Curtir/descurtir       |

---

## 11. Modulo Mais Vistos

**Componente:** `MostViewedComponent`

**Rota:** `/app/most-viewed`

**Descricao:** Exibe videos ordenados por numero de visualizacoes (decrescente).

**Regras:**

**RG-VIEW-01** - Somente videos com `views > 0` sao exibidos.

**RG-VIEW-02** - A lista e atualizada reativamente quando o signal de videos muda.

---

## 12. Modulo Admin - Videos

### 12.1 Gerenciamento de Videos

**Componente:** `VideoAdminComponent`

**Rota:** `/app/video-admin`

**Acesso:** `authGuard` + `adminGuard` (ROLE_ADMIN)

**Descricao:** Formulario para adicionar novos videos e listar/excluir videos e categorias existentes. O cadastro suporta dois contratos: `JSON` com URL publica e `multipart/form-data` com arquivo local.

**Campos do formulario:**

| Campo        | Tipo                  | Obrigatorio | Validacao                                 |
|--------------|-----------------------|-------------|-------------------------------------------|
| title        | text                  | Sim         | Minimo 3 caracteres                       |
| description  | textarea              | Sim         | Minimo 5 caracteres                       |
| url          | url publica ou file   | Sim         | URL `https://` no fluxo JSON ou arquivo local no fluxo multipart |
| cover        | url publica ou file   | Nao         | URL `https://` no fluxo JSON ou arquivo local no fluxo multipart |
| categoryName | text                  | Sim         | Nome da categoria                         |
| recipe       | textarea              | Nao         | -                                         |
| protein      | number                | Nao         | Padrao: 0                                 |
| carbs        | number                | Nao         | Padrao: 0                                 |
| fat          | number                | Nao         | Padrao: 0                                 |
| fiber        | number                | Nao         | Padrao: 0                                 |
| calories     | number                | Nao         | Padrao: 0                                 |

**Funcionalidades de Upload:**

| Funcionalidade   | Descricao                                          |
|------------------|------------------------------------------------------|
| Selecao por clique | Input file padrao                                  |
| Drag-and-drop    | Arrastar arquivo para a area de upload               |
| Feedback visual  | Area muda de cor ao arrastar (`.drag-active`)        |
| Nome do arquivo  | Exibe nome do arquivo selecionado com icone de check |

**Contratos de publicacao:**

| Contrato | Quando ocorre | Payload |
|----------|---------------|---------|
| JSON | Usuario informa URL publica de video/capa | `POST /api/admin/videos` com `title`, `description`, `url`, `cover`, `categoryId` e metadados nutricionais |
| Multipart | Usuario seleciona arquivo local de video e/ou capa | `POST /api/admin/videos` com `FormData` contendo `video`, `cover` opcional, `title`, `description`, `categoryId`, `recipe`, `protein`, `carbs`, `fat`, `fiber`, `calories` |

**Regras:**

**RG-VADM-01** - O campo `categoryName` aceita texto livre. O sistema busca ou cria a categoria automaticamente via `CategoriesService.ensureCategoryId()`.

**RG-VADM-02** - Fluxo de resolucao de categoria:
1. Busca na lista local (normalizado)
2. Busca na lista atualizada da API (`GET /api/categories?type=VIDEO`)
3. Cria automaticamente (`POST /api/categories`)
4. Se a criacao retorna sem ID, busca a lista novamente

**RG-VADM-03** - Apos salvar com sucesso, o formulario e limpo e uma notificacao de sucesso e exibida.

**RG-VADM-04** - Quando o usuario seleciona arquivo local, o front nao persiste `blob:`, caminho local nem apenas `file.name` como URL final; o envio passa a ser multipart.

**RG-VADM-05** - No fluxo JSON, `url` e `cover` devem ser URLs publicas validas (`https://`), nao `blob:`, `data:`, `localhost` ou caminhos locais.

**RG-VADM-06** - Em caso de erro, uma notificacao de erro e exibida.

**Endpoints chamados:**

| Acao               | Endpoint                          |
|--------------------|-----------------------------------|
| Listar categorias  | `GET /api/categories?type=VIDEO`  |
| Criar categoria    | `POST /api/categories`            |
| Criar video via JSON | `POST /api/admin/videos`        |
| Criar video via multipart | `POST /api/admin/videos`   |
| Excluir video      | `DELETE /api/admin/videos/{id}`   |
| Excluir categoria  | `DELETE /api/categories/{id}`     |

---

## 13. Modulo Admin - Cardapios

### 13.1 Gerenciamento de Cardapios

**Componente:** `MenuAdminComponent`

**Rota:** `/app/menu-admin`

**Acesso:** `authGuard` + `adminGuard` (ROLE_ADMIN)

**Descricao:** Formulario para adicionar novos cardapios e listar/excluir cardapios e categorias existentes.

**Campos do formulario:**

| Campo           | Tipo     | Obrigatorio | Validacao            |
|-----------------|----------|-------------|----------------------|
| title           | text     | Sim         | Minimo 3 caracteres  |
| description     | textarea | Sim         | Minimo 5 caracteres  |
| categoryName    | text     | Sim         | Nome da categoria    |
| cover           | file     | Nao         | Arquivo de imagem    |
| recipe          | textarea | Nao         | -                    |
| nutritionistTips| textarea | Nao         | -                    |
| protein         | number   | Nao         | Padrao: 0            |
| carbs           | number   | Nao         | Padrao: 0            |
| fat             | number   | Nao         | Padrao: 0            |
| fiber           | number   | Nao         | Padrao: 0            |
| calories        | number   | Nao         | Padrao: 0            |

**Regras:** Identicas ao VideoAdminComponent (RG-VADM-01 a RG-VADM-04), adaptadas para tipo `MENU`.

**Endpoints chamados:**

| Acao               | Endpoint                          |
|--------------------|-----------------------------------|
| Listar categorias  | `GET /api/categories?type=MENU`   |
| Criar categoria    | `POST /api/categories`            |
| Criar cardapio     | `POST /api/admin/menus`           |
| Excluir cardapio   | `DELETE /api/admin/menus/{id}`    |
| Excluir categoria  | `DELETE /api/categories/{id}`     |

---

## 14. Componentes Compartilhados Reutilizaveis

### 14.1 CategoryCarouselComponent

**Descricao:** Carrossel horizontal generico que agrupa itens por categoria.

| Input          | Tipo           | Descricao                              |
|----------------|----------------|----------------------------------------|
| `title`        | string         | Titulo da categoria                    |
| `items`        | T[]            | Lista de itens a exibir                |
| `itemTemplate` | TemplateRef    | Template customizado para cada item    |

**Regra:** Usa o padrao `ng-template` + `*ngTemplateOutlet` para renderizar cards diferentes (video ou cardapio) com o mesmo componente.

---

### 14.2 EngagementSummaryComponent

**Descricao:** Exibe contadores de curtidas e comentarios com botoes interativos.

| Input           | Tipo    | Descricao                    |
|-----------------|---------|------------------------------|
| `likesCount`    | number  | Numero de curtidas           |
| `commentsCount` | number  | Numero de comentarios        |
| `liked`         | boolean | Se o usuario ja curtiu       |

| Output          | Tipo | Descricao               |
|-----------------|------|--------------------------|
| `likeClick`     | void | Usuario clicou em curtir |
| `commentsClick` | void | Usuario clicou em comentarios |

---

### 14.3 CommentsBoxComponent

**Descricao:** Caixa de comentarios com lista, formulario de envio e botao de exclusao opcional.

| Input               | Tipo          | Descricao                         |
|---------------------|---------------|-----------------------------------|
| `comments`          | string[]      | Lista simples de comentarios      |
| `commentItems`      | CommentItem[] | Lista detalhada (id, text, author)|
| `canDeleteComments` | boolean       | Exibe lixeira em cada comentario  |
| `favorited`         | boolean       | Estado do botao de favorito       |

| Output          | Tipo   | Descricao                    |
|-----------------|--------|------------------------------|
| `favoriteClick` | void   | Toggle favorito              |
| `commentSubmit` | string | Texto do novo comentario     |
| `commentDelete` | string | ID do comentario a excluir   |

---

### 14.4 ConfirmationModalComponent

**Descricao:** Modal generico de confirmacao reutilizado em toda a aplicacao.

| Input        | Tipo    | Padrao       | Descricao                    |
|--------------|---------|--------------|------------------------------|
| `open`       | boolean | false        | Controla visibilidade        |
| `title`      | string  | 'Atencao'    | Titulo do modal              |
| `message`    | string  | 'Deseja continuar?' | Mensagem de confirmacao |
| `confirmText`| string  | 'Confirmar'  | Texto do botao confirmar     |
| `cancelText` | string  | 'Cancelar'   | Texto do botao cancelar      |
| `isDanger`   | boolean | false        | Estilo vermelho de perigo    |

| Output    | Tipo | Descricao          |
|-----------|------|--------------------|
| `confirm` | void | Usuario confirmou  |
| `cancel`  | void | Usuario cancelou   |

---

### 14.5 FavoriteButtonComponent

**Descricao:** Botao de coracao para curtir/descurtir.

| Input      | Tipo    | Descricao          |
|------------|---------|---------------------|
| `favorited`| boolean | Estado do favorito  |

| Output  | Tipo | Descricao     |
|---------|------|---------------|
| `toggle`| void | Toggle clicado|

---

### 14.6 SearchFieldComponent

**Descricao:** Campo de busca com autocomplete, sugestoes e categorias.

| Input         | Tipo     | Descricao                    |
|---------------|----------|------------------------------|
| `placeholder` | string   | Texto placeholder            |
| `value`       | string   | Valor atual                  |
| `disabled`    | boolean  | Desabilitado                 |
| `categories`  | string[] | Categorias para filtro       |
| `suggestions` | string[] | Sugestoes de autocomplete    |

| Output        | Tipo   | Descricao               |
|---------------|--------|--------------------------|
| `valueChange` | string | Texto alterado           |
| `search`      | string | Busca confirmada         |

---

### 14.7 FormFieldComponent (Custom Input)

**Descricao:** Input customizado com mascara, icones e integracao com Reactive Forms (ControlValueAccessor).

| Input         | Tipo     | Descricao                            |
|---------------|----------|--------------------------------------|
| `label`       | string   | Label do campo                       |
| `placeholder` | string   | Placeholder                          |
| `type`        | string   | text, email, password, tel           |
| `icon`        | string   | Icone no lado esquerdo               |
| `error`       | string   | Mensagem de erro                     |
| `maxlength`   | number   | Limite de caracteres                 |
| `showCounter` | boolean  | Exibe contador de caracteres         |
| `mask`        | MaskType | Tipo de mascara (cpf, phone, etc)    |

**Mascaras suportadas:**

| Tipo     | Formato              | Exemplo            |
|----------|----------------------|--------------------|
| cpf      | XXX.XXX.XXX-XX       | 123.456.789-00     |
| cnpj     | XX.XXX.XXX/XXXX-XX   | 12.345.678/0001-00 |
| phone    | (XX) XXXX-XXXX       | (11) 1234-5678     |
| mobile   | (XX) XXXXX-XXXX      | (11) 91234-5678    |
| zipcode  | XXXXX-XXX            | 12345-678          |
| rg       | XX.XXX.XXX-X         | 12.345.678-9       |
| date     | XX/XX/XXXX           | 31/12/2024         |

---

## 15. Servicos Compartilhados

### 15.1 VideoService

**Arquivo:** `shared/services/video/video.service.ts`

**Signals expostos:**

| Signal        | Tipo             | Descricao                    |
|---------------|------------------|------------------------------|
| `videos`      | Signal<Video[]>  | Lista de todos os videos     |
| `totalVideos`  | Computed<number> | Quantidade de videos         |
| `totalLikes`  | Computed<number> | Total de curtidas            |

**Endpoints:**

| Metodo           | Endpoint                      | Descricao              |
|------------------|-------------------------------|------------------------|
| `loadVideos()`   | `GET /api/videos`             | Carrega todos os videos|
| `addVideo()`     | `POST /api/admin/videos`      | Cria video (admin)     |
| `removeVideo()`  | `DELETE /api/admin/videos/{id}`| Exclui video (admin)  |

---

### 15.2 MenuService

**Arquivo:** `shared/services/menus/menus-service.ts`

**Signals expostos:**

| Signal        | Tipo             | Descricao                    |
|---------------|------------------|------------------------------|
| `menus`       | Signal<Menu[]>   | Lista de todos os cardapios  |
| `totalMenus`  | Computed<number> | Quantidade de cardapios      |
| `totalLikes`  | Computed<number> | Total de curtidas            |

**Endpoints:**

| Metodo           | Endpoint                      | Descricao              |
|------------------|-------------------------------|------------------------|
| `loadMenus()`   | `GET /api/menus`              | Carrega todos          |
| `addMenu()`     | `POST /api/admin/menus`       | Cria cardapio (admin)  |
| `removeMenu()`  | `DELETE /api/admin/menus/{id}`| Exclui (admin)         |

---

### 15.3 FavoritesService

**Arquivo:** `shared/services/favorites/favorites.service..ts`

**Signals expostos:**

| Signal            | Tipo                    | Descricao                 |
|-------------------|-------------------------|---------------------------|
| `favorites`       | Signal<FavoriteDTO[]>   | Todos os favoritos        |
| `totalFavorites`  | Computed<number>        | Total de favoritos        |
| `videoFavorites`  | Computed<FavoriteDTO[]> | Favoritos tipo VIDEO      |
| `menuFavorites`   | Computed<FavoriteDTO[]> | Favoritos tipo MENU       |

**Endpoints:**

| Metodo          | Endpoint                               | Descricao           |
|-----------------|----------------------------------------|---------------------|
| `load()`        | `GET /api/favorites`                   | Carrega todos       |
| `loadByType()`  | `GET /api/favorites/{type}`            | Carrega por tipo    |
| `toggle()`      | `POST /api/favorites/{type}/{itemId}`  | Toggle favorito     |
| `getStatus()`   | `GET /api/favorites/{type}/{id}/status`| Verifica status     |

---

### 15.4 CommentsService

**Arquivo:** `shared/services/comments/comments.service.ts`

**Signals expostos:**

| Signal          | Tipo                                    | Descricao           |
|-----------------|-----------------------------------------|---------------------|
| `comments`      | Signal<Record<string, CommentResponse[]>> | Comentarios por video |
| `totalComments` | Computed<number>                        | Total geral         |

**Endpoints:**

| Metodo          | Endpoint                            | Descricao           |
|-----------------|-------------------------------------|---------------------|
| `loadByVideo()` | `GET /api/comments/video/{videoId}` | Carrega por video   |
| `add()`         | `POST /api/comments`                | Cria comentario     |
| `delete()`      | `DELETE /api/comments/{commentId}`  | Exclui (admin)      |

---

### 15.5 CategoriesService

**Arquivo:** `shared/services/categories/categories.service.ts`

**Endpoints:**

| Metodo                | Endpoint                          | Descricao           |
|-----------------------|-----------------------------------|---------------------|
| `list(type)`          | `GET /api/categories?type={type}` | Lista por tipo      |
| `create(payload)`     | `POST /api/categories`            | Cria categoria      |
| `delete(id)`          | `DELETE /api/categories/{id}`     | Exclui categoria    |
| `ensureCategoryId()`  | Multiplos (ver RG-VADM-02)       | Busca ou cria       |

---

### 15.6 ModalService

**Arquivo:** `shared/services/modal/modal.service.ts`

**Signals expostos:**

| Signal          | Tipo                   | Descricao              |
|-----------------|------------------------|------------------------|
| `selectedVideo` | Signal<Video \| null>  | Video selecionado      |
| `isModalOpen`   | Computed<boolean>      | Modal esta aberto      |

**Regra:** Ao abrir o modal, registra visualizacao via `PATCH /api/videos/{id}/view`.

---

### 15.7 NotificationService (Toasts)

**Arquivo:** `shared/services/alert-message/alert-message.service.ts`

**Tipos de alerta:**

| Tipo    | Cor     | Duracao  |
|---------|---------|----------|
| success | Verde   | 2000ms   |
| error   | Vermelho| 4000ms   |
| warning | Amarelo | 4000ms   |
| info    | Azul    | 4000ms   |

---

### 15.8 ContentNotificationsService

**Arquivo:** `shared/services/notifications/content-notifications.service.ts`

**Descricao:** Gerencia notificacoes de novos conteudos (persiste em localStorage).

**Signals expostos:**

| Signal         | Tipo                          | Descricao           |
|----------------|-------------------------------|---------------------|
| `notifications`| Signal<ContentNotification[]> | Todas as notificacoes|
| `unreadCount`  | Computed<number>              | Nao lidas           |

---

### 15.9 ViewHistoryService

**Arquivo:** `shared/services/view-history/view-history.service.ts`

**Descricao:** Rastreia videos assistidos por usuario (persiste em localStorage).

**Chave de storage:** `vida-longa-flix:views:{email}`

**Metodos:**

| Metodo               | Descricao                              |
|----------------------|----------------------------------------|
| `registerView()`     | Incrementa contador para um video      |
| `getViews()`         | Retorna historico completo do usuario   |
| `getMostWatchedVideos()` | Top videos por visualizacoes       |
| `clearHistory()`     | Limpa historico do usuario             |

---

## 16. Modelo de Tipos

### Entidade: Video

| Campo       | Tipo              | Descricao                      |
|-------------|-------------------|--------------------------------|
| id          | string            | UUID                           |
| title       | string            | Titulo                         |
| description | string            | Descricao                      |
| url         | string            | URL do video                   |
| cover       | string            | URL da capa                    |
| category    | {id, name}        | Categoria                      |
| comments    | Comment[]         | Lista de comentarios           |
| commentCount| number            | Total de comentarios           |
| views       | number            | Visualizacoes                  |
| watchTime   | number            | Tempo assistido                |
| recipe      | string            | Receita                        |
| protein     | number            | Proteinas (g)                  |
| carbs       | number            | Carboidratos (g)               |
| fat         | number            | Gorduras (g)                   |
| fiber       | number            | Fibras (g)                     |
| calories    | number            | Calorias (kcal)                |
| favorited   | boolean           | Favoritado pelo usuario        |
| likesCount  | number            | Total de curtidas              |

### Entidade: Menu

| Campo           | Tipo              | Descricao                      |
|-----------------|-------------------|--------------------------------|
| id              | string            | UUID                           |
| title           | string            | Titulo                         |
| description     | string            | Descricao                      |
| cover           | string            | URL da capa                    |
| category        | Category          | Categoria                      |
| recipe          | string            | Receita                        |
| nutritionistTips| string            | Dicas da nutricionista         |
| protein         | number            | Proteinas (g)                  |
| carbs           | number            | Carboidratos (g)               |
| fat             | number            | Gorduras (g)                   |
| fiber           | number            | Fibras (g)                     |
| calories        | number            | Calorias (kcal)                |
| favorited       | boolean           | Favoritado pelo usuario        |
| likesCount      | number            | Total de curtidas              |

### Entidade: Category

| Campo | Tipo         | Descricao            |
|-------|--------------|----------------------|
| id    | string       | UUID                 |
| name  | string       | Nome da categoria    |
| type  | CategoryType | VIDEO ou MENU        |

### Entidade: User

| Campo           | Tipo      | Descricao                      |
|-----------------|-----------|--------------------------------|
| id              | string    | UUID                           |
| name            | string    | Nome completo                  |
| email           | string    | E-mail                         |
| taxId           | string    | CPF                            |
| phone           | string    | Telefone                       |
| address         | Address   | Endereco completo              |
| photo           | string    | URL da foto                    |
| profileComplete | boolean   | Perfil esta completo           |
| roles           | string[]  | Perfis (ROLE_USER, ROLE_ADMIN) |

### Entidade: Comment

| Campo | Tipo               | Descricao           |
|-------|--------------------|---------------------|
| id    | string             | UUID                |
| text  | string             | Texto do comentario |
| date  | string             | Data ISO            |
| user  | {id, name}         | Autor               |

### Entidade: ContentNotification

| Campo     | Tipo                    | Descricao                |
|-----------|-------------------------|--------------------------|
| id        | string                  | UUID                     |
| type      | 'VIDEO' \| 'MENU'      | Tipo do conteudo         |
| title     | string                  | Titulo                   |
| createdAt | number                  | Timestamp em milissegundos|
| read      | boolean                 | Lida                     |
| readAt    | number \| null          | Quando foi lida          |

---

## 17. Endpoints da API Consumidos

### Autenticacao

| Metodo | Endpoint                          | Descricao              |
|--------|-----------------------------------|------------------------|
| POST   | `/api/auth/login`                 | Login                  |
| POST   | `/api/auth/register`              | Cadastro               |
| GET    | `/api/users/me`                   | Dados do usuario logado|
| POST   | `/api/auth/password-recovery`     | Recuperar senha        |
| POST   | `/api/auth/password-change/notify`| Confirmacao de troca   |

### Videos

| Metodo | Endpoint                      | Acesso  | Descricao              |
|--------|-------------------------------|---------|------------------------|
| GET    | `/api/videos`                 | Publico | Listar videos          |
| PATCH  | `/api/videos/{id}/view`       | Auth    | Registrar visualizacao |
| POST   | `/api/admin/videos`           | Admin   | Criar video            |
| DELETE | `/api/admin/videos/{id}`      | Admin   | Excluir video          |

### Cardapios

| Metodo | Endpoint                      | Acesso  | Descricao              |
|--------|-------------------------------|---------|------------------------|
| GET    | `/api/menus`                  | Publico | Listar cardapios       |
| POST   | `/api/admin/menus`            | Admin   | Criar cardapio         |
| DELETE | `/api/admin/menus/{id}`       | Admin   | Excluir cardapio       |

### Categorias

| Metodo | Endpoint                      | Acesso  | Descricao              |
|--------|-------------------------------|---------|------------------------|
| GET    | `/api/categories?type={type}` | Publico | Listar categorias      |
| POST   | `/api/categories`             | Admin   | Criar categoria        |
| DELETE | `/api/categories/{id}`        | Admin   | Excluir categoria      |

### Comentarios

| Metodo | Endpoint                            | Acesso  | Descricao              |
|--------|-------------------------------------|---------|------------------------|
| GET    | `/api/comments/video/{videoId}`     | Publico | Listar por video       |
| POST   | `/api/comments`                     | Auth    | Criar comentario       |
| DELETE | `/api/comments/{commentId}`         | Admin   | Excluir comentario     |

### Favoritos

| Metodo | Endpoint                                | Acesso | Descricao           |
|--------|-----------------------------------------|--------|---------------------|
| GET    | `/api/favorites`                        | Auth   | Listar todos        |
| GET    | `/api/favorites/{type}`                 | Auth   | Listar por tipo     |
| POST   | `/api/favorites/{type}/{itemId}`        | Auth   | Toggle favorito     |
| GET    | `/api/favorites/{type}/{itemId}/status` | Auth   | Status do favorito  |

---

## 18. Armazenamento Local

| Chave                              | Tipo           | Descricao                          |
|------------------------------------|----------------|------------------------------------|
| `token`                            | string         | JWT do usuario                     |
| `user`                             | JSON (User)    | Dados do usuario                   |
| `vlflix:content-notifications:v1`  | JSON (array)   | Notificacoes de conteudo           |
| `vida-longa-flix:views:{email}`    | JSON (Record)  | Historico de visualizacoes         |

---

## 19. Testes

**Framework:** Vitest (via `@angular/build:unit-test`)

**Cobertura:** 61 arquivos de teste, 276 testes.

**Areas cobertas:**

| Area                    | Testes                                           |
|-------------------------|--------------------------------------------------|
| AuthService             | Persistencia de sessao, manipulacao de token      |
| Guards                  | authGuard, adminGuard                            |
| Interceptor             | Adicao de header, validacao de JWT               |
| Services                | VideoService, MenuService, FavoritesService, etc |
| Components              | Renderizacao, interacao, formularios             |
| Validators              | Senha forte, formato de CPF, telefone            |
| Utilitarios             | Mascaras, agrupamento, normalizacao              |

---

## 20. Build e Deploy

**Build:** `npx ng build` (saida em `dist/organo/browser`)

**CI:** GitHub Actions (`.github/workflows/ci.yml`)
- Roda em push para `main` e branches `feat/*`
- Roda em PRs para `main`
- Steps: checkout, setup Node 20, npm ci, lint, build, test

**Deploy:** GitHub Actions (`.github/workflows/deploy-aws.yml`)
- Deploy automatico para AWS S3 + CloudFront
- Apenas na branch `main`
