# Cenários de Teste — Migração CSV (TDD)

> **feat:** adicionar opção de migração CSV nas telas `video-admin` e `menu-admin`
>
> Não cria rota/componente novo. Adiciona no **topo** de cada tela existente:
> um título "Importação via CSV" + campo de upload (mesmo padrão visual dos campos que já existem).
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenário.

---

## A1. Renderização — tela video-admin

| # | Cenário | Esperado |
|---|---------|----------|
| 1 | Abrir `/app/video-admin` como admin | No topo da tela (antes do formulário individual) aparece o título "Importação via CSV" |
| 2 | Abaixo do título existe o campo de upload | Campo com ícone `cloud_upload` + texto "Arraste e solte o arquivo CSV aqui ou clique para selecionar" |
| 3 | Formulário individual de cadastro continua abaixo | Seção "Cadastrar Vídeo" (já existente) permanece intacta abaixo do campo CSV |

---

## A2. Renderização — tela menu-admin

| # | Cenário | Esperado |
|---|---------|----------|
| 4 | Abrir `/app/menu-admin` como admin | No topo da tela (antes do formulário individual) aparece o título "Importação via CSV" |
| 5 | Abaixo do título existe o campo de upload | Campo com ícone `cloud_upload` + texto "Arraste e solte o arquivo CSV aqui ou clique para selecionar" |
| 6 | Formulário individual de cadastro continua abaixo | Seção "Cadastrar Menu" (já existente) permanece intacta abaixo do campo CSV |

---

## A3. Campo de upload — clicar para buscar no computador

> Mesmo padrão visual dos campos que já existem: `<label>` com `<input type="file" accept=".csv">` oculto.
> Ao clicar no campo, abre o explorador de arquivos do SO.

| # | Cenário | Esperado |
|---|---------|----------|
| 7 | Clicar no campo de upload | Abre o explorador de arquivos nativo do SO (file picker) filtrado para `.csv` |
| 8 | Selecionar arquivo `.csv` no explorador e confirmar | Explorador fecha, nome do arquivo aparece no campo, ícone muda para `check_circle` |
| 9 | Abrir explorador e clicar "Cancelar" sem selecionar | Nada muda — campo permanece no estado anterior |

---

## A4. Campo de upload — arrastar e soltar

| # | Cenário | Esperado |
|---|---------|----------|
| 10 | Arrastar arquivo `.csv` sobre o campo | Campo fica com classe `drag-active` (borda destacada) |
| 11 | Soltar arquivo `.csv` no campo | Nome do arquivo aparece, ícone muda para `check_circle`, classe `file-selected` aplicada |
| 12 | Tirar o arquivo arrastado de cima do campo sem soltar (dragleave) | Campo volta ao visual normal, sem `drag-active` |

---

## A5. Validação de arquivo no campo

| # | Cenário | Esperado |
|---|---------|----------|
| 13 | Soltar/selecionar arquivo que não é `.csv` (ex: `.pdf`, `.xlsx`) | Alerta: "Apenas arquivos .csv são aceitos." Arquivo rejeitado, campo inalterado |
| 14 | Soltar/selecionar arquivo `.csv` vazio (0 bytes) | Alerta: "O arquivo está vazio." Arquivo rejeitado |
| 15 | Soltar/selecionar arquivo `.csv` maior que 50MB | Alerta: "Arquivo muito grande. Tamanho máximo: 50MB." |
| 16 | Soltar/selecionar arquivo com extensão `.CSV` (maiúsculo) | Aceita normalmente — validação case-insensitive |
| 17 | Selecionar novo arquivo quando já existe um no campo | Substitui o anterior — nome do novo arquivo aparece |
| 18 | Clicar no "X" ao lado do nome do arquivo selecionado | Campo volta ao estado inicial (ícone `cloud_upload` + texto orientativo) |

---

## A6. Envio e loading

> Ao selecionar/soltar um arquivo válido, o campo mostra o arquivo e um botão "Importar" ou envio automático.

| # | Cenário | Esperado |
|---|---------|----------|
| 19 | Arquivo válido selecionado, clicar para importar | Spinner/loading aparece no campo durante o envio ao backend |
| 20 | Durante o envio, campo fica desabilitado | Não permite arrastar ou clicar para selecionar outro arquivo enquanto processa |
| 21 | Envio conclui | Spinner some, campo volta ao estado inicial pronto para novo upload |

---

## A7. Resposta do backend — sucesso total

| # | Cenário | Esperado |
|---|---------|----------|
| 22 | CSV com todas as linhas válidas (ex: 10 vídeos) | Alert success: "10 registros importados com sucesso!" Campo reseta |

---

## A8. Resposta do backend — sucesso parcial

| # | Cenário | Esperado |
|---|---------|----------|
| 23 | CSV com 10 linhas válidas e 2 com erro | Alert warning: "10 importados, 2 com erro." Lista de erros aparece abaixo do campo |
| 24 | Cada erro mostra o número da linha do CSV | Ex: "Linha 3: categoryName 'Yoga' não encontrada.", "Linha 7: title é obrigatório" |
| 25 | Lista de erros com muitas linhas (ex: 20 erros) | Lista exibe com scroll interno, não expande a tela toda |

---

## A9. Resposta do backend — erro total

| # | Cenário | Esperado |
|---|---------|----------|
| 26 | CSV onde nenhuma linha é válida | Alert error: "Nenhum registro importado. Verifique os erros abaixo." Lista de erros exibida |

---

## A10. Erros de rede / servidor

| # | Cenário | Esperado |
|---|---------|----------|
| 27 | Backend retorna erro 500 ou rede falha | Alert error: "Erro ao importar arquivo. Tente novamente." |
| 28 | Backend retorna 401 (token expirado) | Redireciona para login (interceptor existente) |
| 29 | Backend retorna 403 (sem permissão) | Alert error: "Sem permissão para realizar esta ação." |
| 30 | Backend retorna 400 (arquivo corrompido) | Alert error: "Arquivo CSV inválido. Verifique o formato e tente novamente." |
| 31 | Timeout — backend demora mais de 30s | Alert error: "Tempo esgotado. Tente novamente ou reduza o tamanho do arquivo." |

---

## A11. Endpoint correto por tela

| # | Cenário | Esperado |
|---|---------|----------|
| 32 | Upload CSV na tela `video-admin` | Request vai para `POST /api/admin/import/videos` |
| 33 | Upload CSV na tela `menu-admin` | Request vai para `POST /api/admin/import/menus` |

---

## Resumo

| Grupo | Qtd |
|-------|-----|
| A1. Renderização video-admin | 3 |
| A2. Renderização menu-admin | 3 |
| A3. Clicar para buscar | 3 |
| A4. Arrastar e soltar | 3 |
| A5. Validação de arquivo | 6 |
| A6. Envio e loading | 3 |
| A7. Sucesso total | 1 |
| A8. Sucesso parcial | 3 |
| A9. Erro total | 1 |
| A10. Erros de rede/servidor | 5 |
| A11. Endpoint correto | 2 |
| **Total** | **33** |
