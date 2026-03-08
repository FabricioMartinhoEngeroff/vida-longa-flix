# Cenarios de Teste — Envio de Mensagem WhatsApp de Boas-vindas no Registro

> **feat:** ao se registrar pela primeira vez, o backend envia automaticamente
> uma mensagem de boas-vindas via WhatsApp Business API para o numero do usuario.
>
> **Arquitetura:**
> - Frontend coleta o telefone no formulario de registro
> - Frontend envia `POST /api/auth/register` com `{ name, email, password, phone }`
> - Backend cria o usuario, envia a mensagem WhatsApp e retorna o token JWT
> - Frontend NAO tem acesso a API do WhatsApp (credenciais ficam no backend)
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenario.

---

## C1. Formulario de registro — campo telefone

| # | Cenario | Esperado |
|---|---------|----------|
| 1 | Abrir pagina de registro | Campo "Telefone" visivel com placeholder "(00) 00000-0000" e icone phone |
| 2 | Digitar numero com 11 digitos (celular) ex: 11987654321 | Mascara aplicada: `(11) 98765-4321`, campo valido |
| 3 | Digitar numero com 10 digitos (fixo) ex: 1134567890 | Mascara aplicada: `(11) 3456-7890`, campo valido |
| 4 | Digitar numero com 9 digitos (incompleto) | Validacao falha: "Telefone invalido" |
| 5 | Digitar numero com 12+ digitos | Mascara limita a 11 digitos, caracteres extras ignorados |
| 6 | Deixar campo telefone vazio e submeter | Validacao falha: "Campo obrigatorio" |
| 7 | Digitar letras ou caracteres especiais | Mascara remove tudo que nao e digito |

---

## C2. Formulario de registro — submissao com telefone valido

| # | Cenario | Esperado |
|---|---------|----------|
| 8 | Preencher todos os campos corretamente e submeter | Botao "Criar Conta" fica desabilitado (loading), request enviado ao backend |
| 9 | Payload enviado ao backend | `POST /api/auth/register` com `{ name: "Fabricio", email: "fab@email.com", password: "Senha123!", phone: "(11) 98765-4321" }` |
| 10 | Email com espacos e maiusculas enviado | Email normalizado: lowercase + trim antes de enviar |
| 11 | Nome com espacos extras enviado | Nome com trim aplicado |
| 12 | Phone com mascara `(11) 98765-4321` enviado | Backend recebe o phone formatado com mascara |

---

## C3. Resposta do backend — sucesso (registro + WhatsApp enviado)

| # | Cenario | Esperado |
|---|---------|----------|
| 13 | Backend retorna `{ token, user }` com sucesso | Token salvo no localStorage, usuario autenticado |
| 14 | Apos sucesso | Notificacao de sucesso exibida: "Cadastro realizado com sucesso!" |
| 15 | Apos notificacao | Redirecionamento para `/app` apos duracao da notificacao |
| 16 | Sessao salva | `localStorage` contem token + dados do usuario |
| 17 | Usuario recebe WhatsApp | Backend envia mensagem de boas-vindas no numero informado (transparente para o frontend) |

---

## C4. Resposta do backend — erro no registro

| # | Cenario | Esperado |
|---|---------|----------|
| 18 | Backend retorna 409 (email ja cadastrado) | Notificacao de erro com mensagem do backend |
| 19 | Backend retorna 400 (dados invalidos) | Notificacao de erro com mensagem do backend |
| 20 | Backend retorna 500 (erro interno) | Notificacao de erro: mensagem do backend ou "Erro ao registrar usuario" |
| 21 | Backend retorna 429 (rate limit) | Notificacao de erro com mensagem do backend |
| 22 | Rede falha (sem internet) | Notificacao de erro: "Erro ao registrar usuario" |
| 23 | Backend retorna token null/undefined | Erro: "Token not returned by API" tratado internamente |
| 24 | Apos qualquer erro | `loading` volta a false, botao "Criar Conta" reabilitado |

---

## C5. Resposta do backend — registro OK mas WhatsApp falhou

> O backend deve registrar o usuario mesmo que o envio do WhatsApp falhe.
> A falha no WhatsApp NAO deve bloquear o cadastro.

| # | Cenario | Esperado |
|---|---------|----------|
| 25 | Backend registrou usuario mas WhatsApp falhou (numero invalido) | Frontend recebe sucesso normalmente — token + user retornados |
| 26 | Backend registrou usuario mas WhatsApp timeout | Frontend recebe sucesso — cadastro nao e afetado |
| 27 | Backend registrou usuario mas WhatsApp API fora do ar | Frontend recebe sucesso — usuario pode usar o app normalmente |
| 28 | Backend registrou usuario mas cota de mensagens WhatsApp esgotada | Frontend recebe sucesso — nenhuma diferenca para o usuario |

---

## C6. Formato do telefone — mapeamento para WhatsApp

> O backend recebe o phone formatado e precisa converter para formato
> internacional E.164 para a API do WhatsApp: `+55XXXXXXXXXXX`

| # | Cenario | Esperado |
|---|---------|----------|
| 29 | Phone `(11) 98765-4321` enviado pelo frontend | Backend converte para `+5511987654321` para WhatsApp API |
| 30 | Phone `(21) 3456-7890` (fixo) enviado | Backend converte para `+552134567890` — WhatsApp pode nao entregar (fixo) |
| 31 | Phone com DDD de 2 digitos (qualquer estado BR) | Backend adiciona `+55` + DDD + numero |
| 32 | Phone sem DDD ou incompleto | Backend rejeita no registro (validacao) OU ignora WhatsApp |

---

## C7. Validacao do formulario — campos interligados

| # | Cenario | Esperado |
|---|---------|----------|
| 33 | Todos os campos validos | Botao submit habilitado, form valido |
| 34 | Email invalido + telefone valido | Form invalido, nao submete, erro no email |
| 35 | Email valido + telefone invalido | Form invalido, nao submete, erro no telefone |
| 36 | Senha fraca + telefone valido | Form invalido, notificacao com requisito faltando da senha |
| 37 | Nome com menos de 3 caracteres | Form invalido: "Minimo de 3 caracteres" |
| 38 | Email temporario (ex: guerrillamail) | Notificacao: mensagem de email invalido, form nao submete |
| 39 | Email suspeito (ex: dominio desconhecido) | Notificacao: mensagem de email invalido, form nao submete |
| 40 | Todos os campos vazios e clicar submeter | Todos os campos marcados como touched, erros exibidos em cada campo |

---

## C8. Mascara de telefone — applyPhoneMaskAuto

| # | Cenario | Esperado |
|---|---------|----------|
| 41 | Input `11987654321` (11 digitos) | Retorna `(11) 98765-4321` (mascara mobile) |
| 42 | Input `1134567890` (10 digitos) | Retorna `(11) 3456-7890` (mascara fixo) |
| 43 | Input `(11) 98765-4321` (ja formatado) | Remove mascara, reaplicar: `(11) 98765-4321` |
| 44 | Input vazio `""` | Retorna `""` |
| 45 | Input `null` ou `undefined` passado como string | `removeMask` retorna `""`, sem erro |
| 46 | Input com letras `abc11987654321xyz` | Remove letras, aplica mascara nos digitos |

---

## C9. Estado do componente durante registro

| # | Cenario | Esperado |
|---|---------|----------|
| 47 | Antes de submeter | `loading = false`, botao habilitado |
| 48 | Durante request ao backend | `loading = true`, botao desabilitado |
| 49 | Apos sucesso | `loading = false` (no finally), redirecionamento ocorre |
| 50 | Apos erro | `loading = false` (no finally), usuario pode tentar novamente |
| 51 | Duplo clique no botao durante loading | Botao desabilitado impede dupla submissao |

---

## C10. Seguranca — dados sensiveis

| # | Cenario | Esperado |
|---|---------|----------|
| 52 | Credenciais do WhatsApp API | NAO existem no frontend — apenas no backend |
| 53 | Token do WhatsApp Business API | NAO esta em environment.ts nem environment.prod.ts |
| 54 | Phone do usuario no payload | Enviado via HTTPS (TLS) para o backend |
| 55 | Senha no payload | Enviada em texto no body (HTTPS protege em transito, backend faz hash) |
| 56 | Token JWT retornado | Salvo no localStorage, NAO contem dados do WhatsApp |

---

## C11. Primeiro registro vs login subsequente

| # | Cenario | Esperado |
|---|---------|----------|
| 57 | Usuario se registra pela PRIMEIRA vez | Backend envia WhatsApp de boas-vindas |
| 58 | Usuario faz login depois de ja ter se registrado | Backend NAO envia WhatsApp novamente (so no registro) |
| 59 | Usuario tenta se registrar com email ja existente | Backend retorna erro 409, WhatsApp NAO e enviado |
| 60 | Usuario se registra, deleta conta, se registra novamente | Backend envia WhatsApp novamente (novo registro) |

---

## C12. Conteudo da mensagem WhatsApp (backend)

> Estes cenarios sao responsabilidade do backend, mas o frontend
> deve garantir que o nome e telefone enviados estao corretos.

| # | Cenario | Esperado |
|---|---------|----------|
| 61 | Mensagem de boas-vindas | Contem o nome do usuario: "Ola, Fabricio! Bem-vindo(a) ao Vida Longa Flix!" |
| 62 | Nome com acentos (ex: "Joao") | Backend trata acentos corretamente na mensagem |
| 63 | Nome muito longo (100 chars) | Mensagem nao quebra — backend trunca ou usa normalmente |
| 64 | Template de mensagem WhatsApp | Backend usa template aprovado pelo Meta/WhatsApp Business |

---

## C13. Mobile — registro no celular

| # | Cenario | Esperado |
|---|---------|----------|
| 65 | Abrir formulario de registro no celular | Todos os campos visiveis, campo telefone com `type="tel"` abre teclado numerico |
| 66 | Digitar telefone no teclado numerico | Mascara aplicada em tempo real |
| 67 | Autocomplete do navegador preenche telefone | Mascara aplicada ao valor preenchido |
| 68 | Submeter formulario no celular | Mesmo comportamento do desktop |

---

## C14. Integracao frontend-backend — contrato da API

| # | Cenario | Esperado |
|---|---------|----------|
| 69 | Endpoint de registro | `POST /api/auth/register` |
| 70 | Content-Type do request | `application/json` |
| 71 | Campos obrigatorios no payload | `name`, `email`, `password`, `phone` — todos strings |
| 72 | Formato do phone no payload | `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX` (com mascara) |
| 73 | Response de sucesso (201) | `{ token: string, user: { id, name, email, phone, profileComplete, roles } }` |
| 74 | Response de erro (4xx/5xx) | `{ message: string }` ou `{ error: string }` — frontend exibe na notificacao |

---

## C15. Fluxo pos-registro

| # | Cenario | Esperado |
|---|---------|----------|
| 75 | Apos registro bem-sucedido | Sessao salva, user$ emite o novo usuario |
| 76 | profileComplete no user retornado | `false` para novo registro — usuario pode completar depois |
| 77 | Redirecionamento | Vai para `/app` com `replaceUrl: true` (nao pode voltar com browser back) |
| 78 | Tela /app apos redirecionamento | Header carrega, usuario logado, conteudo visivel |

---

## C16. Resiliencia e retry

| # | Cenario | Esperado |
|---|---------|----------|
| 79 | Primeira tentativa falha (erro de rede), usuario tenta novamente | Segundo registro funciona normalmente |
| 80 | Backend lento (5-10s de resposta) | Frontend mantem loading, nao faz timeout prematuro |
| 81 | Usuario fecha aba durante loading | Nenhum efeito colateral — backend processa normalmente |
| 82 | Usuario navega para outra pagina durante loading | Componente destruido, subscribe nao causa erro |

---

## C17. Monitoramento e alertas — falhas na API do WhatsApp

> Quando o envio de WhatsApp falha, o sistema deve notificar o DevOps/Dev
> para que o problema seja investigado rapidamente. O cadastro do usuario
> NAO e afetado, mas a equipe precisa saber que mensagens nao estao sendo entregues.

| # | Cenario | Esperado |
|---|---------|----------|
| 83 | WhatsApp API retorna erro 401 (token expirado/invalido) | Backend registra log de erro com detalhes (status, phone, timestamp). Alerta enviado ao DevOps via canal configurado (email/Slack/GitHub Actions) |
| 84 | WhatsApp API retorna erro 429 (rate limit — cota de mensagens esgotada) | Backend registra log de erro. Alerta enviado ao DevOps com informacao de cota esgotada |
| 85 | WhatsApp API retorna erro 500 (erro interno do Meta/WhatsApp) | Backend registra log de erro. Alerta enviado ao DevOps indicando falha no servico externo |
| 86 | WhatsApp API timeout (sem resposta em X segundos) | Backend registra log de timeout. Alerta enviado ao DevOps com duracao do timeout |
| 87 | WhatsApp API retorna erro de template invalido/nao aprovado | Backend registra log de erro com nome do template. Alerta critico enviado ao DevOps (template precisa ser reaprovado no Meta Business) |
| 88 | WhatsApp API retorna erro de numero invalido (ex: fixo, internacional) | Backend registra log de aviso (warning). NAO alerta DevOps (erro esperado para numeros fixos) |
| 89 | Multiplas falhas consecutivas (ex: 5+ erros em 10 minutos) | Backend detecta padrao de falhas. Alerta critico enviado ao DevOps: "WhatsApp API possivelmente fora do ar" |
| 90 | Primeira falha isolada apos periodo de sucesso | Backend registra log de erro. Alerta de severidade baixa (pode ser transiente) |
| 91 | WhatsApp API volta a funcionar apos periodo de falhas | Backend registra log de recuperacao. Notificacao de resolucao enviada ao DevOps: "WhatsApp API normalizada" |
| 92 | GitHub Actions — health check periodico da API WhatsApp | Workflow scheduled (cron) que testa endpoint de status do WhatsApp Business API. Se falhar, cria Issue no repo ou envia notificacao |
| 93 | GitHub Actions — alerta no deploy quando variavel WHATSAPP_TOKEN nao esta configurada | Workflow de deploy verifica se secret `WHATSAPP_TOKEN` existe. Se ausente, falha o deploy com mensagem clara |
| 94 | Dashboard de logs — metricas de envio | Backend expoe metricas: total enviados, total falhas, taxa de sucesso, ultimo erro. DevOps pode consultar via endpoint protegido ou dashboard (CloudWatch/Grafana) |
| 95 | Alerta de expiracao do token WhatsApp | Backend ou cron job verifica validade do token periodicamente. Alerta enviado X dias antes da expiracao |
| 96 | Log de auditoria — registro de todas as tentativas de envio | Cada tentativa de envio WhatsApp (sucesso ou falha) e registrada com: userId, phone, timestamp, status, erro (se houver) |

---

## C18. Canal de notificacao — configuracao dos alertas

> Definir COMO e ONDE os alertas sao entregues ao DevOps/Dev.

| # | Cenario | Esperado |
|---|---------|----------|
| 97 | Alerta via email (SES/SMTP) | DevOps recebe email com subject claro: "[VidaLongaFlix] WhatsApp API Error — {tipo do erro}" |
| 98 | Alerta via Slack webhook | Mensagem enviada ao canal #alertas com detalhes do erro, severity e link para logs |
| 99 | Alerta via GitHub Actions — criar Issue automaticamente | Workflow cria Issue no repo com label `bug/whatsapp-api`, titulo e corpo com detalhes do erro |
| 100 | Alerta via CloudWatch Alarm (AWS) | Metrica customizada `WhatsAppSendFailure` dispara alarme quando threshold e atingido (ex: 3 falhas em 5 min) |
| 101 | Alerta contem informacoes suficientes para debug | Alerta inclui: timestamp, userId, phone (parcialmente mascarado: `(**) ****-4321`), status code, mensagem de erro, request ID |
| 102 | Phone mascarado nos alertas (LGPD/privacidade) | Alertas e logs NAO exibem telefone completo. Formato: `(XX) XXXXX-4321` (ultimos 4 digitos apenas) |
| 103 | Frequencia de alertas — anti-flood | Sistema agrupa alertas repetidos: maximo 1 alerta por tipo de erro a cada 15 minutos para evitar spam |
| 104 | Severidade dos alertas | 3 niveis: `info` (numero invalido), `warning` (falha isolada), `critical` (multiplas falhas/token expirado/template invalido) |

---

## Resumo

| Grupo | Qtd |
|-------|-----|
| C1. Campo telefone — validacao | 7 |
| C2. Submissao com telefone valido | 5 |
| C3. Sucesso (registro + WhatsApp) | 5 |
| C4. Erro no registro | 7 |
| C5. Registro OK, WhatsApp falhou | 4 |
| C6. Formato telefone para WhatsApp | 4 |
| C7. Validacao campos interligados | 8 |
| C8. Mascara applyPhoneMaskAuto | 6 |
| C9. Estado do componente | 5 |
| C10. Seguranca | 5 |
| C11. Primeiro registro vs login | 4 |
| C12. Conteudo da mensagem (backend) | 4 |
| C13. Mobile | 4 |
| C14. Contrato da API | 6 |
| C15. Fluxo pos-registro | 4 |
| C16. Resiliencia e retry | 4 |
| C17. Monitoramento e alertas — falhas WhatsApp API | 14 |
| C18. Canal de notificacao — configuracao dos alertas | 8 |
| **Total** | **104** |
