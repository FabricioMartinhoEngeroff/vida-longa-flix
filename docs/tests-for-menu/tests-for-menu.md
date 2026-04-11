# Cenarios de Teste — Admin Menus


> **feat:** tela de administracao de cardapios com duas frentes principais:
> importacao via CSV no topo e cadastro/gestao manual de cardapios/categorias.
>
> Objetivo: alinhar o comportamento esperado das regras de menu antes de ampliar
> a cobertura automatizada e ajustar os fluxos que ainda estao incompletos.
>
> Este documento segue o mesmo padrao do `tests-for-video`, mas adaptado para o
> dominio de cardapios. O escopo cobre:
>
> - funcao 1: importacao CSV na tela `menu-admin`
> - funcao 2: cadastro manual, resolucao de categoria, capa, exclusao e estados da tela
> - consumo dessas regras na tela publica de menus e na modal de cardapio
>
> Observacao importante sobre capa local:
>
> - a selecao de imagem local pode usar `blob:` apenas como preview temporario no front
> - o sistema nunca deve persistir `blob:`, `data:`, `localhost` ou caminho local como valor final de `cover`
> - se o backend aceitar apenas URL publica para menu, o submit deve bloquear valores locais
> - se o backend passar a aceitar upload real para menu, o front deve converter o fluxo para upload suportado
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenario.


---


## A1. MenuAdmin — Importacao CSV no topo


| # | Cenario | Esperado |
|---|---------|----------|
| 1 | Abrir rota de admin de cardapios | Titulo "Importacao via CSV" aparece no topo da tela |
| 2 | Tela carregada | Area de upload CSV aparece antes do formulario manual |
| 3 | Upload CSV na tela de menu | Endpoint configurado e `/admin/import/menus` |
| 4 | Usuario usa o upload CSV no `menu-admin` | Regras compartilhadas de validacao/erro do `CsvUploadComponent` continuam valendo |
| 5 | Bloco CSV renderizado | Formulario individual "Adicionar Cardapio" continua logo abaixo, sem perder funcionalidade |


---


## A2. MenuAdmin — Renderizacao inicial do formulario manual


| # | Cenario | Esperado |
|---|---------|----------|
| 6 | Abrir rota de admin de cardapios | Titulo "Adicionar Cardapio" visivel |
| 7 | Formulario renderizado | Campos de titulo e categoria aparecem no primeiro grid |
| 8 | Formulario renderizado | Campo de descricao aparece como bloco proprio |
| 9 | Formulario renderizado | Area de selecao de capa aparece com hint de arrastar/selecionar |
| 10 | Formulario renderizado | Campos de receita e dicas da nutri aparecem |
| 11 | Formulario renderizado | Secao "Informacoes Nutricionais" aparece com campos numericos |
| 12 | Tela carregada | Secoes "Cardapios cadastrados" e "Categorias" aparecem abaixo do formulario |


---


## A3. MenuAdmin — Carregamento e resolucao de categorias


| # | Cenario | Esperado |
|---|---------|----------|
| 13 | Componente inicia | Faz `GET /api/categories?type=MENU` |
| 14 | API retorna categorias | `datalist` da categoria e populada com os nomes retornados |
| 15 | Usuario digita nome de categoria ja existente na lista local | Submit reutiliza o `categoryId` existente |
| 16 | Categoria nao esta na lista local, mas existe na lista fresca da API | `ensureCategoryId()` usa o `id` retornado pela resposta fresca |
| 17 | Categoria nao existe nem localmente nem na lista fresca | Sistema faz `POST /api/categories` para criar a categoria |
| 18 | Backend cria categoria sem devolver `id` no primeiro retorno | Front busca a lista novamente e recupera o `id` da categoria criada |
| 19 | Usuario digita variacao com caixa/acentuacao diferente (ex: "almoco" vs "Almoco") | Comparacao e normalizada; categoria correta e reutilizada |
| 20 | Usuario digita espacos antes/depois do nome da categoria | `trim` e aplicado antes de buscar/criar categoria |


---


## A4. MenuAdmin — Validacao basica do formulario


| # | Cenario | Esperado |
|---|---------|----------|
| 21 | Titulo vazio | Botao salvar permanece desabilitado ou submit e bloqueado |
| 22 | Descricao vazia | Submit e bloqueado |
| 23 | Categoria vazia | Submit e bloqueado |
| 24 | Titulo com menos de 3 caracteres | Submit e bloqueado |
| 25 | Descricao com menos de 5 caracteres | Submit e bloqueado |
| 26 | Todos os campos obrigatorios preenchidos com valores validos | Submit fica habilitado |


---


## A5. MenuAdmin — Campos longos e layout do formulario


| # | Cenario | Esperado |
|---|---------|----------|
| 27 | Campo descricao renderizado | Usa `textarea` full-width, fora do grid de 2 colunas |
| 28 | Campo receita renderizado | Usa `textarea` full-width, fora do grid de 2 colunas |
| 29 | Campo dicas da nutri renderizado | Usa `textarea` full-width, fora do grid de 2 colunas |
| 30 | Textarea de descricao | Tem altura minima confortavel (`rows >= 6`) |
| 31 | Textarea de receita | Tem altura minima confortavel (`rows >= 6`) |
| 32 | Textarea de dicas da nutri | Tem altura minima confortavel (`rows >= 6`) |
| 33 | Digitar Enter na descricao | Quebra de linha e preservada no campo |
| 34 | Digitar Enter na receita | Quebra de linha e preservada no campo |
| 35 | Digitar Enter nas dicas da nutri | Quebra de linha e preservada no campo |
| 36 | Colar texto com multiplas linhas na descricao | Conteudo permanece formatado com `\n` |
| 37 | Colar texto com etapas na receita | Conteudo permanece formatado com `\n` |
| 38 | Colar texto longo nas dicas da nutri | Conteudo permanece formatado com `\n` |
| 39 | Ordem visual do formulario | `titulo + categoria (grid) -> descricao -> upload capa -> receita -> dicas -> nutricionais` |
| 40 | Desktop | Campos curtos ficam no grid; campos longos usam 100% da largura |
| 41 | Mobile | Textareas ocupam toda a largura sem sobreposicao ou perda de espacamento |


---


## A6. MenuAdmin — Capa, preview e drag-and-drop


| # | Cenario | Esperado |
|---|---------|----------|
| 42 | Selecionar arquivo de imagem pelo input | `coverFileName` passa a exibir o nome do arquivo |
| 43 | Arrastar e soltar imagem na area de upload | Nome do arquivo aparece e estado de drag e removido |
| 44 | Usuario arrasta arquivo sobre a area | Classe visual de drag ativo e aplicada |
| 45 | Usuario tira o arquivo de cima sem soltar | Classe visual de drag ativo e removida |
| 46 | Nenhum arquivo selecionado no input | Formulario nao altera `cover` |
| 47 | Usuario escolhe uma segunda imagem antes de salvar | Ultimo arquivo selecionado passa a ser o preview valido |
| 48 | Usuario escolhe imagem local | `blob:` pode ser usado apenas para preview local, nunca como valor final persistido |
| 49 | Campo `cover` recebe URL publica `https://cdn.exemplo.com/capa.jpg` | Valor e considerado valido no fluxo JSON |
| 50 | Campo `cover` recebe `blob:`, `data:`, `localhost` ou caminho local como valor final | Submit deve bloquear o valor invalido ou convertelo para um fluxo de upload suportado |


---


## A7. MenuAdmin — Integracao com backend no cadastro manual


| # | Cenario | Esperado |
|---|---------|----------|
| 51 | Submit valido com categoria resolvida | Front faz `POST /api/admin/menus` com `title`, `description`, `cover`, `categoryId`, `recipe`, `nutritionistTips` e macros |
| 52 | Descricao com multiplas linhas | Payload final preserva `\n` em `description` |
| 53 | Receita com multiplas linhas | Payload final preserva `\n` em `recipe` |
| 54 | Dicas da nutri com multiplas linhas | Payload final preserva `\n` em `nutritionistTips` |
| 55 | Campos numericos vazios ou zerados | Payload envia `protein`, `carbs`, `fat`, `fiber` e `calories` como numero, padrao `0` |
| 56 | Cadastro sem capa | Fluxo nao quebra; payload envia `cover` vazio ou omitido conforme contrato |
| 57 | Backend responde sucesso no `POST` | Service mostra sucesso, gera notificacao local e recarrega `GET /api/menus` |
| 58 | Backend responde erro no `POST` | Usuario recebe erro generico; tela nao quebra |
| 59 | `ensureCategoryId()` falha durante o save | Front mostra erro de categoria e nao chama `addMenu()` |
| 60 | Categoria nova resolvida com sucesso | Lista local de categorias passa a incluir a categoria utilizada no submit |


---


## A8. MenuAdmin — Sucesso de cadastro e reset do formulario


| # | Cenario | Esperado |
|---|---------|----------|
| 61 | Cadastro concluido com sucesso | Mensagem de sucesso e exibida |
| 62 | Cadastro concluido com sucesso | Formulario e resetado |
| 63 | Cadastro concluido com sucesso | `categoryName` volta para string vazia |
| 64 | Cadastro concluido com sucesso | Campos numericos voltam para `0` |
| 65 | Cadastro concluido com sucesso | `coverFileName` e limpo |
| 66 | Cadastro concluido com sucesso | Lista publica de cardapios e recarregada |
| 67 | Cadastro concluido com sucesso | Novo cardapio passa a aparecer na lista apos a recarga |


---


## A9. MenuAdmin — Exclusao de cardapios e categorias


| # | Cenario | Esperado |
|---|---------|----------|
| 68 | Clicar no icone de lixeira de um cardapio | Modal de confirmacao abre com o titulo do cardapio |
| 69 | Confirmar exclusao de cardapio | Chama `removeMenu(id)` e faz `DELETE /api/admin/menus/{id}` via service |
| 70 | Cancelar exclusao de cardapio | Modal fecha sem remover item |
| 71 | Exclusao de cardapio com sucesso | Service exibe sucesso e recarrega a lista publica |
| 72 | Falha na exclusao de cardapio | Service exibe erro e a tela nao quebra |
| 73 | Clicar no icone de lixeira de categoria | Modal de confirmacao abre com contexto de categoria |
| 74 | Confirmar exclusao de categoria | Faz `DELETE /api/categories/{id}` |
| 75 | Exclusao de categoria com sucesso | Categoria e removida da lista local e modal fecha |
| 76 | Falha na exclusao de categoria | Modal fecha ou informa erro sem quebrar a tela |


---


## A10. MenuAdmin — Estados vazios, listas e acessibilidade


| # | Cenario | Esperado |
|---|---------|----------|
| 77 | Nao ha cardapios cadastrados | Secao exibe "Nenhum cardapio cadastrado." |
| 78 | Nao ha categorias cadastradas | Secao exibe "Nenhuma categoria cadastrada." |
| 79 | Ha cardapios cadastrados | Cada item mostra titulo e nome da categoria |
| 80 | Cardapio sem categoria associada | Lista nao quebra; exibe fallback "Sem categoria" se aplicavel |
| 81 | Ha categorias cadastradas | Cada item mostra o nome da categoria |
| 82 | Botao de deletar cardapio | Possui `aria-label="Deletar cardapio"` |
| 83 | Botao de deletar categoria | Possui `aria-label="Deletar categoria"` |
| 84 | Modal de confirmacao aberta | Usuario consegue confirmar/cancelar por teclado e clique |


---


## A11. MenuAdmin — Edge cases e regressao


| # | Cenario | Esperado |
|---|---------|----------|
| 85 | Usuario salva duas vezes rapidamente | Nao cria duplicidade por clique duplo |
| 86 | Usuario digita " Almoco " e categoria existente e "Almoco" | Categoria existente e reutilizada apos `trim` |
| 87 | Usuario digita "almoco" e lista tem "Almoco" | Comparacao case-insensitive resolve a mesma categoria |
| 88 | Descricao longa com paragrafos e bullets | Conteudo nao perde formatacao no fluxo de cadastro/edicao |
| 89 | Receita longa com multiplas etapas | Conteudo nao perde quebras de linha no fluxo de cadastro/edicao |
| 90 | Dicas da nutri com multiplas linhas | Conteudo nao perde quebras de linha no fluxo de cadastro/edicao |
| 91 | Usuario seleciona capa local e salva | Front nunca persiste `blob:` como `cover` final do registro |
| 92 | Registro legado sem `cover` vindo da API | Tela publica e modal usam fallback visual sem quebrar |


---


## A12. Menus — Listagem publica e agrupamento por categoria


| # | Cenario | Esperado |
|---|---------|----------|
| 93 | Acessar `/app/menus` com dados carregados | Cardapios aparecem agrupados por nome da categoria |
| 94 | Cardapio sem categoria valida | Grupo usa fallback "Sem categoria" |
| 95 | Nenhum cardapio disponivel | Tela exibe "Nenhum cardapio cadastrado ainda." |
| 96 | Card de menu renderizado | Exibe imagem, titulo, categoria e descricao |
| 97 | Clicar no card de menu | Modal do cardapio abre com o item selecionado |
| 98 | Usuario admin na tela publica | Botao de lixeira aparece em cada card |
| 99 | Usuario comum na tela publica | Botao de lixeira nao aparece |
| 100 | Capa ausente no card | Card usa `assets/images/Logo.png` como fallback |


---


## A13. Menus — Busca, favoritos, historico e exclusao na pagina publica


| # | Cenario | Esperado |
|---|---------|----------|
| 101 | Query params `tipo=menu&id=xxx` | Tela faz scroll ate o item correspondente |
| 102 | Query params `tipo=categoria-menu&cat=Almoco` | Tela faz scroll ate o bloco da categoria correspondente |
| 103 | Query param `q=termo` | Busca em titulo, descricao e categoria; normaliza acentos e leva ao primeiro match ordenado por titulo |
| 104 | Clicar no botao de curtir do card | Chama `toggleFavorite(id)` no `MenuService` |
| 105 | Clicar no contador/acao de comentarios do card | Abre a modal do cardapio |
| 106 | Abrir modal a partir da pagina publica | `history.pushState` e usado apenas na primeira abertura consecutiva |
| 107 | Fechar modal aberta pela pagina publica | `history.back()` e chamado para sincronizar o historico |
| 108 | Usuario usa o botao voltar do navegador com modal aberta | `popstate` fecha a modal e limpa o estado local |
| 109 | Admin clica na lixeira do card na pagina publica | `stopPropagation()` impede abrir a modal ao mesmo tempo |
| 110 | Confirmar ou cancelar exclusao na pagina publica | Fluxo remove o cardapio corretamente ou fecha o modal sem excluir |


---


## A14. MenuModal — Exibicao, edicao e conteudo multilinha


| # | Cenario | Esperado |
|---|---------|----------|
| 111 | `menu = null` | Modal nao e renderizada |
| 112 | Modal aberta com menu valido | Titulo e descricao aparecem corretamente |
| 113 | `cover` vazio | Modal usa `assets/images/Logo.png` como fallback |
| 114 | `recipe` vazia ou `null` | Exibe "Sem receita cadastrada." |
| 115 | `nutritionistTips` vazia ou `null` | Exibe "Sem dicas cadastradas." |
| 116 | Bloco de macros renderizado | Exibe proteinas, carboidratos, gorduras, fibras e calorias com suas unidades |
| 117 | Usuario clica no botao de fechar | Evento `close` e emitido |
| 118 | Usuario aciona favorito/comentario na modal | Eventos `favorite` e `comment` sao emitidos corretamente |
| 119 | `canEdit = true` | Campos editaveis ficam habilitados na modal |
| 120 | `onFieldSave('title', 'Novo titulo')` | Evento `fieldSave` emite `{ field, value }` correto |
| 121 | Descricao, receita e dicas com `\n` na modal | Conteudo deve preservar visualmente as quebras de linha no modo leitura |
| 122 | Descricao, receita e dicas com `\n` em modo edicao | `textarea` da edicao deve carregar o valor multiline sem perder formatacao |


---


## A15. Menus — Padrao fixo de capa responsiva


> Para padronizar a criacao de capas e garantir boa renderizacao em notebook e
> celular, o sistema deve adotar um unico padrao oficial de imagem para menus:
>
> - proporcao fixa: `16:9`
> - tamanho-base recomendado para criacao: `1600 x 900 px`
> - regra de renderizacao: preencher o container com `cover`, sem distorcer e sem barras vazias
>
> Se a imagem original vier fora do padrao, o sistema pode usar ajuste por CSS
> (`object-fit: cover`) ou uma funcao de normalizacao/crop central. O importante
> e que o resultado final respeite o ratio `16:9` no desktop e no mobile.


| # | Cenario | Esperado |
|---|---------|----------|
| 123 | Time de conteudo cria uma nova capa de menu | Referencia oficial usada para criacao e `1600x900 px` (`16:9`) |
| 124 | Card de menu no desktop renderiza capa padrao `1600x900` | Imagem preenche o card sem distorcao, sem barras laterais e sem topo/fundo vazio |
| 125 | Card de menu no mobile renderiza capa padrao `1600x900` | Imagem continua bem enquadrada, sem distorcao e sem lacunas visuais |
| 126 | Imagem original ja vem em `16:9` | Sistema apenas redimensiona para o card, sem crop inesperado |
| 127 | Imagem quadrada (`1:1`) e enviada como capa | Sistema aplica crop/cover para caber em `16:9` sem deformar |
| 128 | Imagem vertical (`9:16`) e enviada como capa | Sistema aplica crop/cover para caber em `16:9` sem barras vazias |
| 129 | Imagem ultrawide (`21:9`) e enviada como capa | Sistema corta excesso horizontal e preserva preenchimento limpo |
| 130 | Implementacao usa funcao/helper de normalizacao de capa | Helper preserva proporcao, centraliza o enquadramento e entrega saida final coerente com `16:9` |
| 131 | Card de menu e modal usam a mesma referencia de proporcao | Nao ha uma capa "boa no desktop" e "ruim no celular"; o mesmo padrao visual se sustenta nos dois |
| 132 | Capa ausente ou quebrada | Sistema aplica fallback visual sem estourar layout nem quebrar a responsividade |


---


## A16. MenuAdmin + Menus — Negativos complementares


> Lacunas negativas identificadas na revisao geral:
>
> - falha ao carregar categorias no `menu-admin`
> - erros especificos do fluxo CSV do `menu-admin`
> - comentario vazio na modal de cardapio
> - busca sem correspondencia na tela publica de menus


| # | Cenario | Esperado |
|---|---------|----------|
| 133 | `GET /api/categories?type=MENU` falha ao iniciar o `menu-admin` | Tela nao quebra; formulario continua renderizado e lista de categorias permanece vazia |
| 134 | Usuario seleciona arquivo que nao e `.csv` no import de menus | Upload e rejeitado com alerta "Apenas arquivos .csv sao aceitos." |
| 135 | Usuario seleciona `.csv` vazio no import de menus | Upload e rejeitado com alerta "O arquivo esta vazio." |
| 136 | Usuario seleciona `.csv` maior que 50MB no import de menus | Upload e rejeitado com alerta de tamanho maximo |
| 137 | Backend responde `400` no import CSV de menus | Usuario recebe erro de arquivo CSV invalido; importacao nao prossegue |
| 138 | Backend responde `403` no import CSV de menus | Usuario recebe erro de permissao; importacao nao prossegue |
| 139 | Backend responde `500` ou timeout no import CSV de menus | Usuario recebe erro generico/timeout; tela nao quebra |
| 140 | Usuario digita comentario vazio ou apenas espacos na modal de menu | Comentario nao e adicionado ao estado local |
| 141 | Query param `q=termo-inexistente` na tela de menus | Tela nao quebra, nao faz scroll indevido e permanece na listagem atual |
| 142 | Usuario tenta selecionar arquivo que nao e imagem no campo de capa do `menu-admin` | Sistema ignora ou bloqueia o arquivo invalido; nao persiste preview invalido nem envia arquivo indevido |


---


## A17. MenuAdmin — Edicao de capa do cardapio (botao de imagem)


> Fluxo desejado equivalente ao de video: o admin deve conseguir trocar a capa
> de um cardapio ja publicado sem precisar excluir e cadastrar novamente.
>
> Comportamento esperado:
>
> - cada item da lista de cardapios cadastrados exibe botao de editar capa ao lado da lixeira
> - o botao usa o mesmo icone do fluxo de video: `mat-icon` com valor `image`
> - ao clicar no icone, o sistema aciona o input de arquivo do item (`input.click()`) e abre o seletor de imagem do PC
> - ao selecionar a imagem, o sistema envia a nova capa para o backend como multipart (`FormData` com campo `cover`)
> - em sucesso, a lista publica e o card correspondente refletem a nova capa
> - em erro, a capa anterior permanece
> - negativos obrigatorios: cancelamento do seletor, arquivo nao imagem, imagem maior que 10MB, erro do backend e clique duplicado no mesmo item


| # | Cenario | Esperado |
|---|---------|----------|
| 143 | Lista de cardapios cadastrados renderizada no `menu-admin` | Cada item exibe botao de editar capa ao lado da lixeira com icone `image` |
| 144 | Clicar no icone de editar capa | Aciona `input.click()` e abre seletor de arquivo de imagem com `accept=\"image/*\"` |
| 145 | Selecionar imagem valida (`jpg`, `png`, `webp`) | Front chama `updateCover(menuId, file)` para o cardapio correto |
| 146 | Backend responde sucesso na troca de capa | Service envia `PUT /api/admin/menus/{id}` multipart com campo `cover`, recarrega a lista e a nova capa passa a aparecer |
| 147 | Usuario cancela o seletor de arquivo | Nada acontece; estado permanece inalterado |
| 148 | Botao de editar capa possui acessibilidade e icone correto | Possui `aria-label=\"Editar capa\"` e `mat-icon` igual a `image` |
| 149 | Cardapio sem capa anterior | Upload da nova capa funciona normalmente |
| 150 | Troca de capa de dois cardapios diferentes em sequencia | Cada item atualiza apenas sua propria capa |
| 151 | Backend responde erro na troca de capa | Usuario recebe mensagem de erro; capa anterior permanece visivel |
| 152 | Usuario seleciona arquivo que nao e imagem (`.mp4`, `.pdf`) | Sistema ignora ou bloqueia o arquivo; nao envia payload invalido |
| 153 | Usuario seleciona imagem muito grande (>10MB, por exemplo) | Sistema bloqueia antes do envio e exibe erro apropriado |
| 154 | Usuario clica no icone de imagem duas vezes rapidamente | Nao dispara uploads duplicados nem abre fluxos concorrentes para o mesmo item |


---


## A18. Menus — Comportamento geral da tela com edicao de capa


> Se a tela publica de menus tambem receber a funcao de editar capa para admin,
> o comportamento esperado deve seguir o mesmo principio do botao de excluir:
> acao localizada no card, sem abrir a modal acidentalmente e sem quebrar o
> fluxo do usuario comum.


| # | Cenario | Esperado |
|---|---------|----------|
| 155 | Usuario admin visualiza card de menu na tela publica | Card exibe botao de editar capa com icone `image` junto das acoes de admin |
| 156 | Usuario comum visualiza card de menu na tela publica | Botao de editar capa nao aparece |
| 157 | Admin clica no botao de editar capa do card | Seletor de imagem abre via `input.click()` sem abrir a modal do cardapio |
| 158 | Clique no botao de editar capa | `stopPropagation()` impede propagacao para o click principal do card |
| 159 | Upload de nova capa conclui com sucesso na tela publica | Card atualiza a imagem sem quebrar o layout do carrossel/lista |
| 160 | Upload falha na tela publica | Feedback de erro e exibido; card continua com a capa anterior |
| 161 | Nova capa atualizada no card e fora do padrao ideal | Sistema continua aplicando crop/cover responsivo conforme padrao `16:9` |
| 162 | Capa atualizada com sucesso | Modal do cardapio e demais pontos de exibicao passam a usar a nova imagem |
| 163 | Admin atualiza capa enquanto a tela esta em mobile | Interacao continua clicavel e legivel, sem deslocar o card ou quebrar a responsividade |
| 164 | Admin atualiza capa e depois abre a modal do mesmo item | Modal deve refletir a capa nova, nao uma versao antiga em cache local inconsistente |


---


## Resumo


| Grupo | Qtd |
|-------|-----|
| A1. Importacao CSV no topo | 5 |
| A2. Renderizacao inicial do formulario manual | 7 |
| A3. Carregamento e resolucao de categorias | 8 |
| A4. Validacao basica do formulario | 6 |
| A5. Campos longos e layout do formulario | 15 |
| A6. Capa, preview e drag-and-drop | 9 |
| A7. Integracao com backend no cadastro manual | 10 |
| A8. Sucesso de cadastro e reset | 7 |
| A9. Exclusao de cardapios e categorias | 9 |
| A10. Estados vazios, listas e acessibilidade | 8 |
| A11. Edge cases e regressao | 8 |
| A12. Listagem publica e agrupamento | 8 |
| A13. Busca, favoritos, historico e exclusao na pagina publica | 10 |
| A14. Exibicao, edicao e conteudo multilinha na modal | 12 |
| A15. Padrao fixo de capa responsiva | 10 |
| A16. Negativos complementares | 10 |
| A17. Edicao de capa do cardapio | 12 |
| A18. Comportamento geral da tela com edicao de capa | 10 |
| **Total** | **164** |
