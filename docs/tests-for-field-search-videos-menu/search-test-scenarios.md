# Cenarios de Teste — Pesquisa de Videos e Menus

> **feat:** campo de pesquisa no header que busca videos e menus por titulo e categoria
>
> Ao digitar 3+ caracteres, o sistema exibe sugestoes (titulos) e categorias
> que correspondem ao termo digitado. O usuario pode clicar numa sugestao
> para ser levado ate o video ou menu correspondente.
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenario.

---

## B1. SearchField — Renderizacao e abertura

| # | Cenario | Esperado |
|---|---------|----------|
| 1 | Header renderizado | Botao de pesquisa (icone lupa) visivel no header |
| 2 | Clicar no botao de pesquisa | Modal de pesquisa abre com overlay escuro |
| 3 | Modal aberta | Input com placeholder "Pesquisar..." aparece com foco automatico |
| 4 | Clicar no overlay (fora do modal) | Modal fecha |
| 5 | Clicar no botao "x" dentro do modal | Modal fecha |
| 6 | Pesquisa desabilitada (`disabled=true`) | Clicar no botao nao abre o modal |

---

## B2. SearchField — Digitacao e emissao de eventos

| # | Cenario | Esperado |
|---|---------|----------|
| 7 | Digitar qualquer texto no input | Evento `valueChange` emitido com o valor digitado |
| 8 | Pressionar Enter com texto no input | Evento `search` emitido com o texto (trimmed), modal fecha |
| 9 | Pressionar Enter com input vazio ou so espacos | Nenhum evento `search` emitido, modal fecha |
| 10 | Digitar "  banana  " e pressionar Enter | Evento `search` emitido com "banana" (sem espacos extras) |

---

## B3. SearchField — Exibicao de sugestoes e categorias

| # | Cenario | Esperado |
|---|---------|----------|
| 11 | `suggestions` recebe array com itens | Secao "Sugestoes" aparece com botoes pill para cada item |
| 12 | `categories` recebe array com itens | Secao "Categorias" aparece com botoes pill para cada item |
| 13 | `suggestions` vazio e `categories` vazio | Nenhuma secao de resultado aparece |
| 14 | Clicar numa sugestao (ex: "Banana Smoothie") | `value` atualiza, eventos `valueChange` e `search` emitidos, modal fecha |
| 15 | Clicar numa categoria (ex: "Bebidas") | Mesmo comportamento: `valueChange` + `search` emitidos, modal fecha |

---

## B4. Header — Regra dos 3 caracteres

| # | Cenario | Esperado |
|---|---------|----------|
| 16 | Digitar "ba" (2 caracteres) | `searchSuggestions` e `searchCategories` vazios — nada exibido |
| 17 | Digitar "ban" (3 caracteres) com video "Banana Smoothie" cadastrado | `searchSuggestions` contem "Banana Smoothie" |
| 18 | Digitar "banan" (5 caracteres) | Sugestoes filtradas normalmente |
| 19 | Digitar apenas espacos "   " | Nenhuma sugestao exibida |
| 20 | Digitar apenas stop words "de da" | Nenhuma sugestao (tokens filtrados ficam vazios) |

---

| # | Cenario | Esperado |
|---|---------|----------|
| 21 | Dados ja carregados antes do usuario pesquisar | Digitar 3+ chars retorna sugestoes normalmente |
| 22 | Dados carregam DEPOIS do componente inicializar (async HTTP) | Digitar 3+ chars retorna sugestoes apos dados chegarem |
| 23 | Novos videos adicionados ao signal apos pesquisa inicial | Nova pesquisa inclui os novos videos nas sugestoes |
| 24 | Novos menus adicionados ao signal apos pesquisa inicial | Nova pesquisa inclui os novos menus nas sugestoes |
| 25 | Videos removidos do signal | Pesquisa nao retorna mais os videos removidos |

---

## B6. Header — Busca por titulo (sugestoes)

| # | Cenario | Esperado |
|---|---------|----------|
| 26 | Digitar "ban" com video "Banana Smoothie" e menu "Banana Split" | Ambos aparecem em `searchSuggestions` |
| 27 | Titulo duplicado em video e menu (ex: "Salada Tropical") | Aparece apenas 1x nas sugestoes (deduplicado) |
| 28 | Digitar "acucar" com video "Bolo sem Acucar" | Encontra o video (normalizacao de acentos NFD) |
| 29 | Digitar "BANANA" em maiusculo | Encontra "Banana Smoothie" (case-insensitive) |
| 30 | Digitar "smoothie banana" (ordem invertida) | Encontra "Banana Smoothie" (busca por tokens independentes) |
| 31 | Nenhum video/menu cadastrado | `searchSuggestions` vazio, nenhuma secao exibida |

---

## B7. Header — Busca por categoria

| # | Cenario | Esperado |
|---|---------|----------|
| 32 | Digitar "pro" com categoria "Proteinas" existente | `searchCategories` contem "Proteinas" |
| 33 | Mesma categoria em video e menu (ex: "Saladas") | Aparece apenas 1x em `searchCategories` (deduplicado) |
| 34 | Video sem categoria (category null) | Nao quebra — item sem categoria e ignorado na lista |
| 35 | Digitar termo que nao bate com nenhuma categoria | `searchCategories` vazio |

---

## B8. Header — Ordenacao por relevancia

| # | Cenario | Esperado |
|---|---------|----------|
| 36 | Digitar "banana" com titulos "Banana Smoothie" e "Bolo de Banana com Aveia" | Ambos aparecem; "Banana Smoothie" primeiro (score maior — match no inicio) |
| 37 | Dois itens com mesmo score | Ordenados alfabeticamente (pt-BR locale) |
| 38 | Item que nao contem nenhum token do termo | Nao aparece nas sugestoes (score = 0 filtrado) |

---

## B9. Header — Limpar pesquisa

| # | Cenario | Esperado |
|---|---------|----------|
| 39 | Digitar "ban", ver sugestoes, depois apagar o texto | `searchSuggestions` e `searchCategories` voltam a vazio |
| 40 | Digitar "ban", ver sugestoes, depois digitar "xy" (< 3 chars uteis) | Sugestoes limpas |

---

## B10. Header — Navegacao ao selecionar (goToSearch)

| # | Cenario | Esperado |
|---|---------|----------|
| 41 | Selecionar sugestao que e titulo exato de um video | Navega para `/app` com `queryParams: { tipo: 'video', id: <videoId>, q: <termo> }` |
| 42 | Selecionar sugestao que e titulo exato de um menu | Navega para `/app/menus` com `queryParams: { tipo: 'menu', id: <menuId>, q: <termo> }` |
| 43 | Selecionar categoria que pertence a videos | Navega para `/app` com `queryParams: { tipo: 'categoria-video', cat: <nome>, q: <termo> }` |
| 44 | Selecionar categoria que pertence a menus | Navega para `/app/menus` com `queryParams: { tipo: 'categoria-menu', cat: <nome>, q: <termo> }` |
| 45 | Termo digitado nao bate exatamente com nenhum titulo/categoria | Navega para `/app` com `queryParams: { q: <termo> }` (busca generica) |
| 46 | Termo vazio (so espacos) submetido via Enter | Nenhuma navegacao ocorre |
| 47 | Prioridade: video > menu > categoria-video > categoria-menu > busca generica | Se o termo bate com titulo de video E menu, navega para o video |

---

## B11. Pagina destino — Scroll ate o resultado

| # | Cenario | Esperado |
|---|---------|----------|
| 48 | Home recebe `tipo=video` + `id` nos queryParams | Pagina rola ate o card do video correspondente |
| 49 | Home recebe `tipo=categoria-video` + `cat` nos queryParams | Pagina rola ate a secao da categoria |
| 50 | Home recebe `q` sem tipo especifico | Busca o primeiro video cujo titulo/descricao/categoria bate |
| 51 | Menus recebe `tipo=menu` + `id` nos queryParams | Pagina rola ate o card do menu correspondente |
| 52 | Menus recebe `tipo=categoria-menu` + `cat` nos queryParams | Pagina rola ate a secao da categoria |

---

## B12. Mobile — Comportamento especifico

| # | Cenario | Esperado |
|---|---------|----------|
| 53 | Abrir modal de pesquisa no celular | Modal ocupa largura total (100%), teclado virtual abre |
| 54 | Digitar 3+ chars no celular | Sugestoes e categorias aparecem normalmente (mesmo comportamento do desktop) |
| 55 | Tocar numa sugestao no celular | Navegacao ocorre, modal fecha, teclado fecha |
| 56 | Pressionar "Ir"/"Go"/"Enter" no teclado virtual | Evento `search` emitido, modal fecha |
| 57 | Fechar teclado virtual (blur no input) | Modal permanece aberta, sugestoes continuam visiveis |

---

## B13. Tokenizacao e stop words

| # | Cenario | Esperado |
|---|---------|----------|
| 58 | Digitar "de banana" | Stop word "de" removida, busca por token "banana" apenas |
| 59 | Digitar "a e o as os" (todas stop words) | Nenhum token valido, `searchSuggestions` vazio |
| 60 | Digitar "da do das dos um uma com para por" (todas stop) | Nenhum token, nenhuma sugestao |
| 61 | Digitar "ok" (2 chars, nao e stop word) como parte de termo maior "ok banana" | Token "ok" aceito (>= 2 chars e nao e stop) |
| 62 | Digitar "x y z" (tokens com 1 char cada) | Todos filtrados (< 2 chars), nenhuma sugestao |
| 63 | Digitar "de banana smoothie" | Stop word removida, busca por "banana" + "smoothie" |
| 64 | Digitar "  ban  " (espacos extras ao redor) | Trim aplicado, busca por "ban" normalmente |

---

## B14. Estado do modal entre aberturas

| # | Cenario | Esperado |
|---|---------|----------|
| 65 | Abrir modal, digitar "ban", fechar (overlay), reabrir | O `value` do input persiste com "ban" (estado mantido no componente) |
| 66 | Abrir modal, sugestoes visiveis, fechar, reabrir | Sugestoes continuam visiveis (categories/suggestions nao sao limpos ao fechar) |
| 67 | Selecionar sugestao (choose), reabrir modal | `value` mostra o texto da sugestao selecionada |

---

## B15. Dados edge cases

| # | Cenario | Esperado |
|---|---------|----------|
| 68 | Video com titulo vazio `""` | Nao aparece nas sugestoes (score 0 para qualquer busca) |
| 69 | Video com `category: null` | Nao quebra; video aparece nas sugestoes por titulo, categoria ignorada |
| 70 | Video com `category: undefined` | Mesmo que null — nao quebra |
| 71 | Video com `category: { name: '' }` (string vazia) | Categoria vazia filtrada pelo `.filter(Boolean)`, nao aparece em categorias |
| 72 | Menu com `category: { name: null }` | categoryName fallback para `''`, nao quebra |
| 73 | Titulo com caracteres especiais (ex: "Bolo #1 (especial)") | Busca funciona normalmente, caracteres nao-alfanumericos nao interferem |
| 74 | Titulo muito longo (200+ caracteres) | Sugestao aparece normalmente, layout nao quebra (text overflow) |
| 75 | Muitos resultados (200+ videos com "banana" no titulo) | Todos retornados em `searchSuggestions`, ordenados por relevancia |

---

## B16. Colisao de prioridade no goToSearch

> O `goToSearch` segue a ordem: video exato > menu exato > categoria-video > categoria-menu > busca generica.

| # | Cenario | Esperado |
|---|---------|----------|
| 76 | Titulo de video = titulo de menu (ex: "Salada Tropical") | Navega para `/app` (video tem prioridade sobre menu) |
| 77 | Titulo de video = nome de categoria (ex: "Proteinas") | Navega como video (`tipo=video`), nao como categoria |
| 78 | Titulo de menu = nome de categoria de video (ex: "Bebidas") | Navega como menu (`tipo=menu`), nao como categoria |
| 79 | Categoria existe em videos e menus (ex: "Saladas") | Navega como `categoria-video` (video-category tem prioridade) |
| 80 | Nenhum match exato mas termo parcial bate | Fallback para busca generica `/app?q=<termo>` |

---

## B17. Navegacao — mesmo contexto e erros

| # | Cenario | Esperado |
|---|---------|----------|
| 81 | Usuario ja esta em `/app`, pesquisa video que esta na mesma pagina | Rola ate o video sem reload completo da pagina |
| 82 | Usuario esta em `/app/menus`, pesquisa video (rota diferente) | Navega para `/app` com queryParams, pagina carrega e rola |
| 83 | Usuario pesquisa video por ID, mas video foi deletado | Pagina carrega mas nao encontra o card — nenhum scroll, nenhum erro |
| 84 | Usuario pesquisa menu por ID, mas menu foi deletado | Mesmo comportamento — fallback silencioso |
| 85 | QueryParams com caracteres especiais (ex: `q=açúcar & mel`) | URL codificada corretamente, busca funciona |

---

## B18. Acessibilidade

| # | Cenario | Esperado |
|---|---------|----------|
| 86 | Botao de pesquisa no header | Possui `aria-label="Pesquisar"` |
| 87 | Input de pesquisa dentro do modal | Recebe foco automatico ao abrir (acessivel por teclado) |
| 88 | Pressionar Escape dentro do modal | Modal fecha (comportamento padrao esperado) |
| 89 | Navegar por Tab entre pills de sugestao | Foco move entre os botoes de sugestao/categoria |
| 90 | Leitor de tela no botao de sugestao | Texto do botao e o nome do video/menu/categoria |

---

## B19. Interacao input — paste e composicao

| # | Cenario | Esperado |
|---|---------|----------|
| 91 | Colar (Ctrl+V / Cmd+V) texto "banana" no input | Evento `input` dispara, `valueChange` emitido com "banana" |
| 92 | Colar texto com 2 chars "ba" | `valueChange` emitido, mas nenhuma sugestao (< 3 chars) |
| 93 | Autocomplete do navegador preenche o input | Evento `input` dispara normalmente, sugestoes aparecem se >= 3 chars |
| 94 | IME (teclado japones/chines/coreano) com composicao | `input` event so dispara apos composicao finalizar |

---

## B20. Performance e limites

| # | Cenario | Esperado |
|---|---------|----------|
| 95 | Base com 1000+ videos e 500+ menus | Pesquisa retorna resultados sem lag perceptivel |
| 96 | Digitar rapido (keystroke a cada 50ms) | Cada keystroke atualiza sugestoes, sem acumulo de renders |
| 97 | Index reconstruido apos signal mudar | Apenas o signal alterado e reindexado (videos e menus sao effects separados) |

---

## Resumo

| Grupo | Qtd |
|-------|-----|
| B1. Renderizacao e abertura | 6 |
| B2. Digitacao e emissao de eventos | 4 |
| B3. Exibicao de sugestoes e categorias | 5 |
| B4. Regra dos 3 caracteres | 5 |
| B5. Index reativo (bug corrigido) | 5 |
| B6. Busca por titulo (sugestoes) | 6 |
| B7. Busca por categoria | 4 |
| B8. Ordenacao por relevancia | 3 |
| B9. Limpar pesquisa | 2 |
| B10. Navegacao ao selecionar | 7 |
| B11. Pagina destino — scroll | 5 |
| B12. Mobile | 5 |
| B13. Tokenizacao e stop words | 7 |
| B14. Estado do modal entre aberturas | 3 |
| B15. Dados edge cases | 8 |
| B16. Colisao de prioridade | 5 |
| B17. Navegacao — mesmo contexto e erros | 5 |
| B18. Acessibilidade | 5 |
| B19. Interacao input — paste e composicao | 4 |
| B20. Performance e limites | 3 |
| **Total** | **97** |
