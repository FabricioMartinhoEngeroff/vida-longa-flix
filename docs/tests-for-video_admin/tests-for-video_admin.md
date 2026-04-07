# Cenarios de Teste — Admin Videos


> **feat:** tela de administracao de videos com cadastro, selecao de capa/video,
> validacao de midia, upload real e exclusao segura.
>
> Objetivo: alinhar o comportamento esperado do fluxo de publicacao de videos
> antes de escrever testes e implementar ajustes.
>
> O sistema agora pode operar em dois contratos de publicacao, e os cenarios abaixo distinguem explicitamente esses caminhos:
>
> - JSON com URL publica (`url` e `cover`)
> - multipart com arquivo local (`videoFile` e `coverFile`) enviado para o mesmo endpoint `POST /api/admin/videos`
>
> Considerar como referencia invalida de midia no fluxo JSON:
>
> - `blob:...`
> - `data:...`
> - caminho local (`C:/...`, `/home/...`)
> - `localhost`
> - nome de arquivo sem URL publica (`video.mp4`)
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenario.


---


## A1. VideoAdmin — Renderizacao inicial


| # | Cenario | Esperado |
|---|---------|----------|
| 1 | Abrir rota de admin de videos | Titulo "Adicionar Video" visivel |
| 2 | Tela carregada | Bloco de importacao CSV aparece acima do formulario |
| 3 | Formulario renderizado | Campos de titulo, descricao e categoria aparecem |
| 4 | Formulario renderizado | Area de selecao de video aparece com hint de arrastar/selecionar |
| 5 | Formulario renderizado | Area de selecao de capa aparece com hint de arrastar/selecionar |
| 6 | Tela carregada sem videos cadastrados | Secao "Videos cadastrados" mostra estado vazio |


---


## A2. VideoAdmin — Carregamento de categorias


| # | Cenario | Esperado |
|---|---------|----------|
| 7 | Componente inicia | Faz `GET /api/categories?type=VIDEO` |
| 8 | API retorna categorias | Datalist da categoria e populado com os nomes retornados |
| 9 | Usuario digita nome de categoria existente | Sistema reutiliza a categoria existente no submit |
| 10 | Usuario digita categoria nao presente na lista local | Sistema busca lista atualizada antes de concluir o save |
| 11 | Categoria existe so na resposta fresca da API | Cadastro usa o `categoryId` retornado pela API atualizada |
| 12 | Falha ao carregar categorias | Tela nao quebra; usuario recebe feedback de erro ou permanece sem sugestoes |


---


## A3. VideoAdmin — Validacao basica do formulario


| # | Cenario | Esperado |
|---|---------|----------|
| 13 | Titulo vazio | Botao salvar permanece desabilitado ou submit e bloqueado |
| 14 | Descricao vazia | Submit e bloqueado |
| 15 | Categoria vazia | Submit e bloqueado |
| 16 | Titulo com menos de 3 caracteres | Submit e bloqueado |
| 17 | Descricao com menos de 5 caracteres | Submit e bloqueado |
| 18 | Todos os campos obrigatorios preenchidos com valores validos | Submit fica habilitado |


---


## A4. VideoAdmin — Campos longos e layout do formulario


| # | Cenario | Esperado |
|---|---------|----------|
| 19 | Campo descricao renderizado | Usa area de texto mais aberta, nao um input de linha unica |
| 20 | Campo receita renderizado | Usa area de texto mais aberta, nao um input de linha unica |
| 21 | Digitar texto longo na descricao | Campo expande visualmente e permite leitura confortavel |
| 22 | Digitar texto longo na receita | Campo expande visualmente e permite leitura confortavel |
| 23 | Pressionar Enter na descricao | Quebra de linha e preservada no campo |
| 24 | Pressionar Enter na receita | Quebra de linha e preservada no campo |
| 25 | Colar texto com multiplas linhas na descricao | Conteudo permanece formatado com quebras de linha |
| 26 | Colar texto com multiplas linhas na receita | Conteudo permanece formatado com quebras de linha |
| 27 | Formulario em desktop | Campos ficam alinhados visualmente, sem alturas desalinhadas ou blocos quebrados |
| 28 | Formulario em mobile | Campos empilham corretamente sem sobreposicao ou perda de espacamento |
| 29 | Descricao e receita com muito conteudo | Layout continua bonito, com espacamento consistente entre campos e secoes |


---


## A5. VideoAdmin — Selecao de video e capa


| # | Cenario | Esperado |
|---|---------|----------|
| 30 | Selecionar um arquivo de video pelo input | Nome do arquivo aparece na area de upload de video |
| 31 | Arrastar e soltar um arquivo de video | Nome do arquivo aparece e estado de drag e removido |
| 32 | Selecionar uma imagem de capa pelo input | Nome do arquivo aparece na area de upload de capa |
| 33 | Arrastar e soltar uma imagem de capa | Nome do arquivo aparece e estado de drag e removido |
| 34 | Nenhum arquivo selecionado no input de video | Formulario nao altera `url` nem `videoFile` |
| 35 | Nenhum arquivo selecionado no input de capa | Formulario nao altera `cover` nem `coverFile` |
| 36 | Usuario substitui o video por outro arquivo antes de salvar | Ultimo arquivo selecionado passa a ser o valido |
| 37 | Usuario substitui a capa por outra imagem antes de salvar | Ultima capa selecionada passa a ser a valida |


---


## A6. VideoAdmin — Contrato de midia valida


| # | Cenario | Esperado |
|---|---------|----------|
| 38 | `url` recebe URL publica `https://cdn.exemplo.com/video.mp4` | Valor e considerado valido no fluxo JSON |
| 39 | `cover` recebe URL publica `https://cdn.exemplo.com/capa.jpg` | Valor e considerado valido no fluxo JSON |
| 40 | `url` recebe `blob:...` | Cadastro JSON deve ser bloqueado com mensagem clara |
| 41 | `cover` recebe `blob:...` | Cadastro JSON deve ser bloqueado com mensagem clara |
| 42 | `url` recebe `data:video/...` | Cadastro JSON deve ser bloqueado |
| 43 | `cover` recebe `data:image/...` | Cadastro JSON deve ser bloqueado |
| 44 | `url` recebe caminho local `C:/Users/.../video.mp4` | Cadastro JSON deve ser bloqueado |
| 45 | `cover` recebe caminho local `/home/user/capa.jpg` | Cadastro JSON deve ser bloqueado |
| 46 | `url` recebe `http://localhost:3000/video.mp4` | Cadastro JSON deve ser bloqueado |
| 47 | `url` recebe apenas `video.mp4` | Cadastro JSON deve ser bloqueado |


---


## A7. VideoAdmin — Integracao com backend (dois contratos)


| # | Cenario | Esperado |
|---|---------|----------|
| 48 | Submit com URL publica | Front faz `POST /api/admin/videos` em JSON com `title`, `description`, `url`, `cover` e `categoryId` |
| 49 | Submit com arquivos locais | Front usa fluxo multipart com `videoFile` e `coverFile`; nao envia `blob:` em JSON nem persiste apenas `file.name` como URL final |
| 50 | Descricao com multiplas linhas | Payload final preserva as quebras de linha enviadas pelo usuario |
| 51 | Receita com multiplas linhas | Payload final preserva as quebras de linha enviadas pelo usuario |
| 52 | Backend responde `201` no fluxo JSON | Sistema recarrega a lista publica de videos |
| 53 | Backend responde sucesso no fluxo multipart | Sistema conclui o cadastro, exibe sucesso e recarrega a lista publica de videos |
| 54 | Backend responde `422` com erro em `url` | Tela mostra feedback indicando que `url` nao e publica/valida |
| 55 | Backend responde `422` com erro em `cover` | Tela mostra feedback indicando que `cover` nao e publica/valida |
| 56 | Backend responde `500` no submit | Usuario recebe erro generico sem reset indevido do formulario |
| 57 | Backend responde sucesso mas a recarga da lista falha | Tela nao quebra; usuario recebe erro ao atualizar lista |


---


## A8. VideoAdmin — Fluxo esperado para arquivo local (multipart principal)


> Esta secao representa o fluxo principal para publicar arquivo local quando o usuario seleciona arquivos no dispositivo.
>
> Contrato atual implementado no front:
>
> - `POST /api/admin/videos`
> - `Content-Type: multipart/form-data`
> - campo de arquivo principal: `video`
> - campo de arquivo opcional de capa: `cover`
> - metadados enviados no mesmo `FormData`: `title`, `description`, `categoryId`, `recipe`, `protein`, `carbs`, `fat`, `fiber`, `calories`


| # | Cenario | Esperado |
|---|---------|----------|
| 58 | Usuario seleciona MP4 local baixado do Instagram/WhatsApp | Front prepara upload real, sem tentar salvar `blob:` ou caminho local em JSON |
| 59 | Usuario seleciona imagem local de capa | Front prepara upload real, sem tentar salvar `blob:` ou caminho local em JSON |
| 60 | Usuario salva com `videoFile` e `coverFile` validos | Front envia multipart com ambos os arquivos e todos os metadados obrigatorios no `FormData` |
| 61 | Usuario salva com `videoFile` valido e sem `coverFile` | Front envia multipart apenas com `video`; fluxo nao quebra |
| 62 | Upload do video falha | Componente delega ao service; service mostra erro generico e nao ha cadastro bem-sucedido |
| 63 | Upload da capa falha | Componente delega ao service; service mostra erro generico e nao ha cadastro bem-sucedido |
| 64 | Upload local conclui com sucesso | Front limpa formulario, limpa `videoFileName` e `coverFileName` e recarrega a lista |


---


## A9. VideoAdmin — Sucesso de cadastro


| # | Cenario | Esperado |
|---|---------|----------|
| 65 | Cadastro concluido com sucesso | Mensagem de sucesso e exibida |
| 66 | Cadastro concluido com sucesso | Formulario e resetado |
| 67 | Cadastro concluido com sucesso | `categoryName` volta para string vazia |
| 68 | Cadastro concluido com sucesso | Campos numericos voltam para `0` |
| 69 | Cadastro concluido com sucesso | `videoFileName` e limpo |
| 70 | Cadastro concluido com sucesso | `coverFileName` e limpo |
| 71 | Cadastro concluido com sucesso | Novo video aparece na lista apos recarga |


---


## A10. VideoAdmin — Exclusao de videos e categorias


| # | Cenario | Esperado |
|---|---------|----------|
| 72 | Clicar no icone de lixeira de um video | Modal de confirmacao abre |
| 73 | Confirmar exclusao de video | Chama `removeVideo(id)` |
| 74 | Cancelar exclusao de video | Modal fecha sem remover item |
| 75 | Clicar no icone de lixeira de categoria | Modal de confirmacao abre com contexto de categoria |
| 76 | Confirmar exclusao de categoria | Faz `DELETE /api/categories/{id}` |
| 77 | Exclusao de categoria com sucesso | Categoria e removida da lista local |
| 78 | Falha na exclusao de categoria | Modal fecha ou informa erro sem quebrar a tela |


---


## A11. VideoAdmin — Estados vazios e listas


| # | Cenario | Esperado |
|---|---------|----------|
| 79 | Nao ha videos cadastrados | Secao exibe "Nenhum video cadastrado." |
| 80 | Ha videos cadastrados | Cada item mostra titulo e nome da categoria |
| 81 | Video sem categoria associada | Lista nao quebra; exibe fallback "Sem categoria" se aplicavel |
| 82 | Nao ha categorias cadastradas | Secao exibe "Nenhuma categoria cadastrada." |
| 83 | Lista de videos atualiza apos exclusao | Item removido deixa de aparecer sem precisar recarregar manualmente a pagina |


---


## A12. VideoAdmin — Mobile e acessibilidade


| # | Cenario | Esperado |
|---|---------|----------|
| 84 | Abrir admin de videos no mobile | Layout empilha campos sem quebrar a tela |
| 85 | Area de upload no mobile | Continua clicavel e legivel |
| 86 | Descricao e receita no mobile | Permanecem usaveis, com altura adequada para texto longo |
| 87 | Botao de deletar video | Possui `aria-label="Deletar video"` |
| 88 | Botao de deletar categoria | Possui `aria-label="Deletar categoria"` |
| 89 | Modal de confirmacao aberta | Usuario consegue confirmar/cancelar por teclado e clique |


---


## A13. VideoAdmin — Edge cases e regressao


| # | Cenario | Esperado |
|---|---------|----------|
| 90 | Usuario digita espacos na categoria | Trim e aplicado antes de buscar/criar categoria |
| 91 | Usuario salva duas vezes rapidamente | Nao cria duplicidade por clique duplo |
| 92 | Usuario seleciona video local, remove a selecao e salva | Submit segue a regra definida para ausencia de midia valida |
| 93 | Usuario informa capa vazia e video invalido no fluxo JSON | Erro principal continua em `url`; cadastro nao prossegue |
| 94 | API publica devolve exatamente as URLs salvas | Player e capa devem usar as URLs persistidas sem transformacao extra no front |
| 95 | Registro legado com `url` quebrada vindo da API | Tela publica nao deve quebrar a pagina inteira ao tentar renderizar |
| 96 | Descricao longa com paragrafos e listas simples | Conteudo digitado nao perde formatacao basica no fluxo de cadastro/edicao |
| 97 | Receita longa com multiplas etapas | Conteudo digitado nao perde quebras de linha no fluxo de cadastro/edicao |


---


## A14. VideoZoomModal — Exibicao de descricao e receita com quebras de linha


> A descricao e a receita podem conter quebras de linha (`\n`) inseridas pelo usuario
> no formulario de cadastro. A modal de detalhe do video deve preservar essas quebras
> visualmente, tanto no modo leitura quanto no modo edicao.


| # | Cenario | Esperado |
|---|---------|----------|
| 98 | Descricao com `\n` exibida na modal | Quebras de linha aparecem visualmente (nao fica tudo em uma linha so) |
| 99 | Receita com `\n` exibida na modal | Quebras de linha aparecem visualmente na caixa de receita |
| 100 | Descricao com multiplos paragrafos na modal | Cada paragrafo aparece separado visualmente |
| 101 | Receita com etapas numeradas separadas por `\n` | Cada etapa aparece em sua propria linha |
| 102 | Editable-field em modo leitura com `\n` | Texto exibido preserva as quebras de linha via `white-space: pre-line` ou equivalente |
| 103 | Editable-field em modo edicao (textarea) | Conteudo carregado no textarea ja exibe as quebras de linha corretamente |
| 104 | Descricao vazia ou `null` na modal | Exibe texto de fallback (`emptyText`) sem quebrar layout |
| 105 | Receita vazia ou `null` na modal | Exibe "Sem receita cadastrada." sem quebrar layout |
| 106 | Descricao com apenas espacos em branco e `\n` | Modal nao exibe blocos vazios estranhos; renderiza espacamento limpo |
| 107 | Receita com apenas espacos em branco e `\n` | Caixa de receita nao exibe linhas vazias excessivas |
| 108 | Descricao muito longa sem nenhuma quebra de linha | Texto faz word-wrap normalmente sem transbordar o container da modal |


---


## A15. Home/Carousel — Descricao nao deve aparecer no card de video


> O card de video exibido no carrossel da home (tanto mobile quanto desktop) nao deve
> exibir a descricao do video. A descricao so deve ser visivel ao abrir a modal de detalhe
> (`video-zoom-modal`).


| # | Cenario | Esperado |
|---|---------|----------|
| 109 | Card de video no carrossel (desktop) | Descricao do video nao e exibida no card |
| 110 | Card de video no carrossel (mobile) | Descricao do video nao e exibida no card |
| 111 | Card de video exibe apenas titulo | Titulo do video continua visivel no card |
| 112 | Abrir modal a partir do card | Descricao completa aparece somente dentro da modal |
| 113 | Card sem descricao nao afeta layout | Espacamento e alinhamento do card permanecem consistentes |
| 114 | Video com descricao muito longa | Card nao estoura altura nem exibe texto escondido parcialmente |
| 115 | Video com descricao `null` ou vazia | Card renderiza normalmente sem espacos extras ou elementos vazios |
| 116 | Video sem campo descricao (undefined) | Card nao quebra; titulo e acoes continuam visiveis |


---


## Resumo


| Grupo | Qtd |
|-------|-----|
| A1. Renderizacao inicial | 6 |
| A2. Carregamento de categorias | 6 |
| A3. Validacao basica do formulario | 6 |
| A4. Campos longos e layout do formulario | 11 |
| A5. Selecao de video e capa | 8 |
| A6. Contrato de midia valida | 10 |
| A7. Integracao com backend | 10 |
| A8. Fluxo esperado para arquivo local | 7 |
| A9. Sucesso de cadastro | 7 |
| A10. Exclusao de videos e categorias | 7 |
| A11. Estados vazios e listas | 5 |
| A12. Mobile e acessibilidade | 6 |
| A13. Edge cases e regressao | 8 |
| A14. Exibicao com quebras de linha na modal | 11 |
| A15. Card do carrossel sem descricao | 8 |
| **Total** | **116** |
