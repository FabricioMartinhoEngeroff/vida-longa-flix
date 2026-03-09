# Cenarios de Teste — Login & Registro (TDD)

> **feat:** fluxo completo de autenticacao — Authorization, Login, Register, Password Recovery, Password Change
>
> Rotas: `/authorization`, `/login`, `/register`, `/password-change?token=...`
>
> Revisar e aprovar antes de implementar.
> Marque com ✅ (aprovado), ❌ (remover) ou ✏️ (alterar) cada cenario.

---

## B1. Authorization page — renderizacao e layout

| # | Cenario | Esperado |
|---|---------|----------|
| 1 | Abrir `/authorization` | Exibe painel esquerdo com marca "Vida Longa Flix Saude" + "Seja bem-vindo!" + "Politica de Privacidade" |
| 2 | Estado inicial `isRegistering = false` | Painel direito renderiza `<app-login>`, **nao** exibe `<app-register>` |
| 3 | `isRegistering = true` | Painel direito renderiza `<app-register>` + footer "Ja possui uma conta? Faca login..." |
| 4 | Clicar "Ja possui uma conta? Faca login..." | `toggleMode()` alterna `isRegistering` para `false`, mostra `<app-login>` |
| 5 | Dentro do login clicar "Criar conta" | Emite `goToRegister` → `toggleMode()` → mostra `<app-register>` |

---

## B2. Authorization page — rota default

| # | Cenario | Esperado |
|---|---------|----------|
| 6 | Navegar para `/` (rota raiz) | `redirectTo: 'authorization'` — redireciona para `/authorization` |
| 7 | Navegar para rota inexistente (ex: `/xyz`) | Wildcard redirect ou 404, nao quebra a aplicacao |

---

## B3. Login — renderizacao do formulario

| # | Cenario | Esperado |
|---|---------|----------|
| 8 | Abrir `/login` (ou `<app-login>` via authorization) | Titulo "Acesso ao Vida Longa Flix" visivel |
| 9 | Campo e-mail presente | Input type `email`, icone `mail`, placeholder "seu@email.com", `autocomplete="email"`, `maxlength="254"`, counter visivel |
| 10 | Campo senha presente | Input type `password`, icone `lock`, placeholder "Digite sua senha", `autocomplete="current-password"`, `maxlength="128"`, counter visivel |
| 11 | Checkbox "Manter conectado" | Checkbox com label "Manter conectado", desmarcado por padrao (`keepLoggedIn = false`) |
| 12 | Link "Esqueci minha senha" | Link clicavel que chama `openPasswordRecovery()` |
| 13 | Botao "Entrar" presente | Botao type `submit`, texto "Entrar", `[disabled]="loading"` |
| 14 | Divider e botao "Criar conta" | Texto "Nao tem uma conta?" + botao "Criar conta" tipo `button` que chama `register()` |

---

## B4. Login — validacao de campos

| # | Cenario | Esperado |
|---|---------|----------|
| 15 | Submeter formulario vazio | `markAllAsTouched()` executado, form continua invalido, `signIn()` retorna early, nao faz request |
| 16 | E-mail vazio, campo tocado | Erro: "Required field" |
| 17 | E-mail invalido (ex: "abc", "user@") | Erro: "Invalid email" |
| 18 | E-mail valido (ex: "user@example.com") | Sem erro no campo |
| 19 | E-mail no limite maximo (254 chars) | Counter mostra "254/254", campo aceita exatamente 254 |
| 20 | Senha vazia, campo tocado | Erro: "Required field" |
| 21 | Senha com menos de 6 caracteres (ex: "12345") | Erro: "Minimum 6 characters" |
| 22 | Senha com exatamente 6 caracteres (ex: "123456") | Sem erro no campo |
| 23 | Senha no limite maximo (128 chars) | Counter mostra "128/128", campo aceita exatamente 128 |
| 24 | Erro generico para valor invalido sem match | Retorna "Invalid value" |

---

## B5. Login — visibilidade da senha

| # | Cenario | Esperado |
|---|---------|----------|
| 25 | Campo senha tipo inicial | `inputType = 'password'` (texto oculto), icone direito `eye` |
| 26 | Clicar icone olho (toggle password) | `passwordVisible = true`, `inputType = 'text'` (texto visivel), icone muda para `eyeOff` |
| 27 | Clicar novamente no icone | `passwordVisible = false`, volta para `password`, icone volta para `eye` |

---

## B6. Login — submissao com sucesso

| # | Cenario | Esperado |
|---|---------|----------|
| 28 | Preencher e-mail e senha validos, submeter | `loading = true`, chama `authService.login(email, password, keepLoggedIn)` |
| 29 | Backend retorna token + user | `saveSession()` persiste sessao, `router.navigateByUrl('/app', { replaceUrl: true })` |
| 30 | `keepLoggedIn = false` (checkbox desmarcado) | Sessao salva em **sessionStorage** (`saveSession(..., 'session')`) |
| 31 | `keepLoggedIn = true` (checkbox marcado) | Sessao salva em **localStorage** (`saveSession(..., 'local')`) |
| 32 | Apos submit, loading volta a false | `finally { this.loading = false }` executado em qualquer caso |

---

## B7. Login — normalizacao de dados

| # | Cenario | Esperado |
|---|---------|----------|
| 33 | E-mail com espacos e maiusculas "  User@EXAMPLE.COM  " | `mapLoginToApi()` faz trim + lowercase → `"user@example.com"` |
| 34 | Senha com espacos nas pontas "  abc123  " | `mapLoginToApi()` faz trim → `"abc123"` |
| 35 | E-mail null/undefined no mapper | `(email ?? '').trim().toLowerCase()` retorna `""` sem erro |
| 36 | Senha null/undefined no mapper | `(password ?? '').trim()` retorna `""` sem erro |

---

## B8. Login — tratamento de erros

| # | Cenario | Esperado |
|---|---------|----------|
| 37 | Backend retorna HTTP 401 (credenciais invalidas) | `handleApiError()` extrai mensagem do body, `logger.error()` logado, loading volta a false |
| 38 | Backend retorna HTTP 500 (erro interno) | `handleApiError()` extrai contexto "Erro ao fazer login", erro logado no console |
| 39 | Backend retorna body `{ message: "Email nao cadastrado" }` | `handleApiError()` retorna Error com "Email nao cadastrado" |
| 40 | Backend retorna body `{ error: "Invalid credentials" }` | `handleApiError()` retorna Error com "Invalid credentials" (fallback para `payload.error`) |
| 41 | Backend retorna body string pura | `handleApiError()` usa string como mensagem |
| 42 | Backend retorna body vazio | `handleApiError()` usa contexto "Erro ao fazer login" |
| 43 | Rede falha (sem conexao) | Erro capturado no catch, `logger.error()` chamado, loading reseta |
| 44 | Token nao retornado pelo backend (`response.token` undefined) | Erro "Token not returned by API" lancado antes de salvar sessao |

---

## B9. Login — sessao e persistencia (AuthService)

| # | Cenario | Esperado |
|---|---------|----------|
| 45 | Login com `keepLoggedIn = true` | Token e user salvos em **localStorage**; sessionStorage limpo |
| 46 | Login com `keepLoggedIn = false` | Token e user salvos em **sessionStorage**; localStorage limpo |
| 47 | `loadSession()` com localStorage populado | Carrega user do localStorage, `userSubject.next(user)` |
| 48 | `loadSession()` com apenas sessionStorage populado | Fallback: carrega user do sessionStorage |
| 49 | `loadSession()` com ambos storages populados | Prioriza localStorage (`localToken ?? sessionToken`) |
| 50 | `loadSession()` com user JSON invalido | `catch` no JSON.parse → `clearSession()` |
| 51 | `loadSession()` sem nenhum storage | `userSubject` permanece null, sem erro |
| 52 | `getToken()` | Retorna `localStorage.getItem('token') ?? sessionStorage.getItem('token')` |
| 53 | `isAuthenticated()` com token presente | Retorna `true` |
| 54 | `isAuthenticated()` sem token | Retorna `false` |

---

## B10. Login — botao "Criar conta"

| # | Cenario | Esperado |
|---|---------|----------|
| 55 | Clicar "Criar conta" no login | `router.navigateByUrl('/register')` — navega para tela de registro |

---

## B11. Login — modal "Esqueci minha senha"

| # | Cenario | Esperado |
|---|---------|----------|
| 56 | Clicar "Esqueci minha senha" | `recoveryOpen = true`, `<app-password-recovery [open]="true">` exibido |
| 57 | Dentro do modal, clicar "Voltar para o Login" | `goToLogin()` → emite `close` → `recoveryOpen = false`, modal fecha |

---

## B12. Register — renderizacao do formulario

| # | Cenario | Esperado |
|---|---------|----------|
| 58 | Abrir `/register` (ou `<app-register>` via authorization) | Titulo "Crie sua conta", subtitulo "Complete seu perfil depois dentro do app", logo visivel |
| 59 | Campo E-mail presente | Input type `email`, icone `mail`, placeholder "seu@email.com", `maxlength="254"`, counter ativo |
| 60 | Campo Nome completo presente | Input type `text`, icone `user`, placeholder "Digite seu nome", `maxlength="100"`, counter ativo |
| 61 | Campo Telefone presente | Input type `tel`, icone `phone`, placeholder "(00) 00000-0000", mask `phone`, `maxlength="15"`, counter desativado |
| 62 | Campo Senha presente | Input type `password`, icone `lock`, placeholder "Crie uma senha forte", `maxlength="128"`, counter ativo |
| 63 | Indicador de forca da senha | `<app-password-strength-indicator [password]="currentPassword" [showRequirements]="true">` |
| 64 | Botao "Criar Conta" presente | Botao type `submit`, texto "Criar Conta", `[disabled]="loading"` |
| 65 | Link "Ja tem uma conta? Faca login" | Link com `routerLink="/authorization"` |
| 66 | `<app-email-adjustment-message>` condicional | Aparece somente quando `emailErrorType` nao e null |

---

## B13. Register — validacao de campos

| # | Cenario | Esperado |
|---|---------|----------|
| 67 | Submeter formulario vazio | `markAllAsTouched()`, form invalido, notificacao FIX_ERRORS: "Corrija os erros antes de continuar." |
| 68 | Nome vazio, campo tocado | Erro: "Campo obrigatorio" |
| 69 | Nome com menos de 3 caracteres (ex: "AB") | Erro: "Minimo de 3 caracteres" |
| 70 | Nome com exatamente 3 caracteres (ex: "Ana") | Sem erro |
| 71 | Nome no limite maximo (100 chars) | Counter "100/100", aceita exatamente 100 |
| 72 | E-mail vazio, campo tocado | Erro: "Campo obrigatorio" |
| 73 | E-mail invalido (ex: "abc", "user@") | Erro: "E-mail invalido" |
| 74 | E-mail valido (ex: "maria@gmail.com") | Sem erro |
| 75 | Telefone vazio, campo tocado | Erro: "Campo obrigatorio" |
| 76 | Telefone com menos de 10 digitos (ex: "119876543") | Erro: "Telefone invalido" (pattern `/^\d{10,11}$/`) |
| 77 | Telefone com exatamente 10 digitos (fixo) | Sem erro, valor clean "1134567890" |
| 78 | Telefone com exatamente 11 digitos (celular) | Sem erro, valor clean "11987654321" |
| 79 | Telefone com mais de 11 digitos | Erro: "Telefone invalido" |
| 80 | Senha vazia, campo tocado | Erro: "Campo obrigatorio" |
| 81 | Senha com menos de 8 caracteres (ex: "Ab1!xyz") | Erro: "Minimo de 8 caracteres" |
| 82 | Senha fraca sem maiuscula (ex: "abcdefgh1!") | Erro: "Uma letra maiuscula (A-Z)" (primeiro requisito faltando) |
| 83 | Senha fraca sem minuscula (ex: "ABCDEFGH1!") | Erro: "Uma letra minuscula (a-z)" |
| 84 | Senha fraca sem numero (ex: "Abcdefgh!") | Erro: "Um numero (0-9)" |
| 85 | Senha fraca sem caractere especial (ex: "Abcdefgh1") | Erro: "Um caractere especial (!@#$%...)" |
| 86 | Senha forte (ex: "Abcdef1!") | Sem erro `senhaFraca` — validator retorna null |

---

## B14. Register — mascara de telefone (FormFieldComponent + MaskService)

| # | Cenario | Esperado |
|---|---------|----------|
| 87 | Digitar "11987654321" no campo telefone | Exibe "(11) 98765-4321" no input, envia "11987654321" (clean) para o form |
| 88 | Digitar "1134567890" no campo telefone | Exibe "(11) 3456-7890" no input, envia "1134567890" (clean) |
| 89 | Colar telefone ja formatado "(11) 98765-4321" | Remove mascara, reaplica → exibe "(11) 98765-4321", clean "11987654321" |
| 90 | Input com letras "abc11987654321xyz" | `removeMask` extrai digitos, aplica mascara celular |

---

## B15. Register — visibilidade da senha

| # | Cenario | Esperado |
|---|---------|----------|
| 91 | Campo senha tipo inicial | `inputType = 'password'`, icone `eye` |
| 92 | Toggle visibilidade | `inputType = 'text'`, icone `eyeOff`, texto visivel |
| 93 | Toggle de volta | `inputType = 'password'`, icone `eye` |

---

## B16. Register — validacao de e-mail especial (domain checks)

| # | Cenario | Esperado |
|---|---------|----------|
| 94 | E-mail com dominio temporario (ex: "@tempmail.com") | `emailErrorType = 'temporary'`, exibe `<app-email-adjustment-message>`, notificacao INVALID_EMAIL no submit |
| 95 | E-mail com dominio suspeito | `emailErrorType = 'suspicious'`, exibe componente de ajuste, notificacao INVALID_EMAIL no submit |
| 96 | E-mail com erro `emailInvalido` customizado | `emailErrorType = 'invalid'`, exibe mensagem customizada |
| 97 | E-mail normal (sem erros custom) | `emailErrorType = null`, sem componente de ajuste |
| 98 | `updateEmailError()` com controle nao tocado | `emailErrorType = null` (nao exibe mensagem antes de tocar) |

---

## B17. Register — forca da senha (strongPasswordValidator)

| # | Cenario | Esperado |
|---|---------|----------|
| 99 | Senha vazia | Strength: VERY_WEAK, 0%, "Digite uma senha", cor cinza |
| 100 | Senha "abc" (1 ponto: lowercase) | Strength: VERY_WEAK, 20%, "Muito fraca", cor vermelha |
| 101 | Senha "abcdefgh" (2 pontos: length + lowercase) | Strength: WEAK, 40%, "Fraca", cor amarela |
| 102 | Senha "Abcdefgh" (3 pontos: length + upper + lower) | Strength: MEDIUM, 60%, "Media", cor amarelo-ouro |
| 103 | Senha "Abcdef1!" (4 pontos: length + upper + lower + number + special = 5) | Strength: VERY_STRONG, 100% ou STRONG 80% dependendo do calculo |
| 104 | Senha "Abcdefgh1!" (5 pontos base) | Strength: VERY_STRONG, 100%, "Muito forte", cor verde |
| 105 | Senha 12+ caracteres com todos requisitos | Bonus +0.5 pontos (length >= 12) |
| 106 | Senha 16+ caracteres com todos requisitos | Bonus adicional +0.5 (length >= 16), total 6 pontos |
| 107 | Validator com `minLevel = STRONG (3)` e senha fraca | Retorna `{ senhaFraca: { forca, mensagem, requisitos, requisitosFaltando } }` |
| 108 | Validator com senha que atende STRONG | Retorna `null` (sem erro) |

---

## B18. Register — submissao com sucesso

| # | Cenario | Esperado |
|---|---------|----------|
| 109 | Preencher todos os campos validos, submeter | `loading = true`, chama `authService.register(data)` |
| 110 | Backend retorna token + user | `saveSession(token, user, 'local')` — registro sempre salva em localStorage |
| 111 | Sucesso no registro | Notificacao: "Cadastro concluido com sucesso!" (REGISTRATION_SUCCESS) |
| 112 | Apos notificacao de sucesso | `setTimeout(() => router.navigateByUrl('/app', { replaceUrl: true }))` com duracao de notificacao success |
| 113 | Loading reseta apos completar | `finally { this.loading = false }` |

---

## B19. Register — normalizacao de dados (AuthService.mapRegisterToApi)

| # | Cenario | Esperado |
|---|---------|----------|
| 114 | Nome "  Joao Silva  " | `trim()` → "Joao Silva" |
| 115 | E-mail "  User@EXAMPLE.COM  " | `trim().toLowerCase()` → "user@example.com" |
| 116 | Password enviado sem modificacao | `data.password ?? ''` (sem trim, sem lowercase) |
| 117 | Phone "11987654321" | `applyPhoneMaskAuto()` → "(11) 98765-4321" (formatado para backend) |
| 118 | Phone "1134567890" | `applyPhoneMaskAuto()` → "(11) 3456-7890" |

---

## B20. Register — tratamento de erros

| # | Cenario | Esperado |
|---|---------|----------|
| 119 | Backend retorna HTTP 409 (e-mail ja cadastrado) | `handleApiError()` extrai "Email ja cadastrado", `notificationService.error(message)` |
| 120 | Backend retorna HTTP 400 com `{ message: "Dados invalidos" }` | Notificacao error: "Dados invalidos" |
| 121 | Backend retorna HTTP 400 com `{ error: "Bad request" }` | Notificacao error: "Bad request" (fallback para `payload.error`) |
| 122 | Backend retorna HTTP 500 | Notificacao error: mensagem ou fallback GENERIC_ERROR: "Erro ao processar sua solicitacao. Tente novamente." |
| 123 | Rede falha | `notificationService.error(e.message)`, `logger.error(e)` |
| 124 | Token nao retornado | Error "Token not returned by API" antes de salvar sessao |
| 125 | Backend retorna sem user no body | Cria user default com `name, email, phone` do payload, `profileComplete: false`, `roles: []` |

---

## B21. Register — submit com erros de validacao especificos

| # | Cenario | Esperado |
|---|---------|----------|
| 126 | Submit com e-mail temporario (errors `emailTemporario`) | Notificacao INVALID_EMAIL: "Por favor, use um email valido e profissional.", retorna early |
| 127 | Submit com e-mail suspeito (errors `emailSuspeito`) | Mesmo: notificacao INVALID_EMAIL, retorna early |
| 128 | Submit com senha fraca (errors `senhaFraca`) | Notificacao warning com primeiro requisito faltando (ex: "Uma letra maiuscula (A-Z)"), retorna early |
| 129 | Submit com campos invalidos generico | Notificacao FIX_ERRORS: "Corrija os erros antes de continuar." |
| 130 | Submit com formulario valido e sem erros especiais | Prossegue para `this.loading = true` e request |

---

## B22. Password Recovery (modal) — renderizacao

| # | Cenario | Esperado |
|---|---------|----------|
| 131 | `[open]="false"` | Modal nao renderizado (`@if (open)` falso) |
| 132 | `[open]="true"` | Modal renderizado com: logo, titulo "Recuperar Senha", subtitulo "Digite seu e-mail para receber o link de recuperacao" |
| 133 | Campo e-mail presente | Input type `email`, icone `mail`, placeholder "seu@email.com", label "E-mail" |
| 134 | Botao "Enviar Link de Recuperacao" | Botao tipo `submit`, `[disabled]="recoveryForm.invalid \|\| loading"` |
| 135 | Link "Voltar para o Login" | Botao que chama `goToLogin()` |

---

## B23. Password Recovery — validacao

| # | Cenario | Esperado |
|---|---------|----------|
| 136 | Submeter com e-mail vazio | `markAllAsTouched()`, form invalido, retorna early |
| 137 | E-mail invalido, campo tocado | Erro: "Digite um e-mail valido" |
| 138 | Botao desabilitado com form invalido | `[disabled]="recoveryForm.invalid \|\| loading"` |

---

## B24. Password Recovery — submissao com sucesso

| # | Cenario | Esperado |
|---|---------|----------|
| 139 | Submeter com e-mail valido | `loading = true`, chama `emailService.sendPasswordRecovery(email)` |
| 140 | Backend responde sucesso | `successMessage = "Link de recuperacao enviado. Verifique seu e-mail."` exibido como `<p class="success-message">` |
| 141 | Apos sucesso, auto-fecha | `setTimeout(() => goToLogin(), 2000)` — modal fecha apos 2 segundos |
| 142 | Loading reseta | `finally { this.loading = false }` |

---

## B25. Password Recovery — tratamento de erros

| # | Cenario | Esperado |
|---|---------|----------|
| 143 | Backend falha | `errorMessage = "Nao foi possivel enviar o e-mail. Tente novamente."` exibido como `<p class="error-message">` |
| 144 | Erro logado | `logger.error('Erro ao enviar e-mail de recuperacao:', e)` |
| 145 | Loading reseta apos erro | `finally { this.loading = false }` |

---

## B26. Password Recovery — goToLogin (limpar estado)

| # | Cenario | Esperado |
|---|---------|----------|
| 146 | Chamar `goToLogin()` | `recoveryForm.reset({ email: '' })`, `errorMessage = null`, `successMessage = null`, `loading = false` |
| 147 | Emite evento `close` | `this.close.emit()` — pai (LoginComponent) define `recoveryOpen = false` |

---

## B27. Password Recovery — EmailService

| # | Cenario | Esperado |
|---|---------|----------|
| 148 | `sendPasswordRecovery("user@example.com")` | POST para `{baseURL}/auth/password-recovery` com `{ email: "user@example.com" }` |
| 149 | E-mail com espacos/maiusculas | Normaliza: `trim().toLowerCase()` antes de enviar |
| 150 | E-mail vazio/null | Lanca `Error('Email is required for password recovery.')` |

---

## B28. Password Change — renderizacao e estados

| # | Cenario | Esperado |
|---|---------|----------|
| 151 | Abrir `/password-change?token=abc` | Estado inicial: `validatingToken = true`, exibe spinner + "Validando link..." |
| 152 | Token valido apos validacao | `tokenValid = true`, exibe formulario com titulo "Redefinir senha", subtitulo "Digite sua nova senha abaixo" |
| 153 | Token invalido apos validacao | `tokenValid = false`, exibe icone erro + "Link invalido" + "Este link pode ter expirado ou ja foi utilizado." + "Redirecionando para o login..." |
| 154 | Token ausente (sem `?token=`) | Notificacao INVALID_TOKEN: "Link invalido ou expirado.", redireciona para `/login` |
| 155 | Painel esquerdo | "Vida Longa Flix Saude", "Redefina sua senha", "Seguranca em primeiro lugar" |

---

## B29. Password Change — formulario

| # | Cenario | Esperado |
|---|---------|----------|
| 156 | Campo "Nova Senha" presente | Input password, icone `lock`, placeholder "Digite a nova senha", `maxlength="128"`, counter ativo |
| 157 | Indicador de forca da senha | `<app-password-strength-indicator>` com `[password]="currentPassword"` e `[showRequirements]="true"` |
| 158 | Campo "Confirmar Nova Senha" presente | Input password, icone `lock`, placeholder "Digite novamente", `maxlength="128"`, counter desativado |
| 159 | Botao "Redefinir senha" presente | Botao submit, `[disabled]="loading"` |
| 160 | Link "← Voltar para o login" | `routerLink="/login"` |

---

## B30. Password Change — validacao

| # | Cenario | Esperado |
|---|---------|----------|
| 161 | Submeter formulario vazio | `markAllAsTouched()`, form invalido, notificacao FIX_ERRORS |
| 162 | Nova senha vazia, campo tocado | Erro: "Required field" |
| 163 | Nova senha < 8 caracteres | Erro: "Minimum 8 characters" |
| 164 | Nova senha fraca (sem requisitos) | Erro: primeiro requisito faltando (strongPasswordValidator) |
| 165 | Nova senha forte | Sem erro |
| 166 | Confirmacao vazia, campo tocado | Erro: "Required field" |
| 167 | Senhas diferentes (nova != confirmacao) | Notificacao PASSWORDS_DO_NOT_MATCH: "As senhas digitadas nao sao iguais." |
| 168 | Senhas iguais e validas | Prossegue para request |

---

## B31. Password Change — submissao com sucesso

| # | Cenario | Esperado |
|---|---------|----------|
| 169 | Preencher senhas iguais e validas, submeter | `loading = true`, chama `recoveryService.changePassword(token, newPassword)` |
| 170 | Backend responde sucesso | Notificacao PASSWORD_CHANGED: "Senha alterada com sucesso!" |
| 171 | Apos sucesso, redirect | `setTimeout(() => router.navigate(['/login']))` com duracao de notificacao success |
| 172 | Loading reseta | `finally { this.loading = false }` |

---

## B32. Password Change — tratamento de erros

| # | Cenario | Esperado |
|---|---------|----------|
| 173 | Backend falha ao alterar senha | Notificacao ERROR_RESETTING_PASSWORD: "Erro ao redefinir senha. Tente novamente." |
| 174 | Erro logado | `logger.error('Erro ao alterar senha:', e)` |
| 175 | Loading reseta apos erro | `finally { this.loading = false }` |

---

## B33. Password Change — validacao de token (ngOnInit)

| # | Cenario | Esperado |
|---|---------|----------|
| 176 | `recoveryService.validateToken(token)` retorna `true` | `tokenValid = true`, formulario exibido |
| 177 | `recoveryService.validateToken(token)` retorna `false` | `tokenValid = false`, notificacao INVALID_TOKEN, redirect para `/login` |
| 178 | `recoveryService.validateToken(token)` lanca excecao | Notificacao ERROR_VALIDATING_TOKEN: "Erro ao validar link. Tente novamente.", `tokenValid = false` |
| 179 | `validatingToken` reseta apos validacao | `finally { this.validatingToken = false }` — spinner desaparece |

---

## B34. Auth Guard — protecao de rotas

| # | Cenario | Esperado |
|---|---------|----------|
| 180 | Usuario autenticado acessa rota protegida | `authService.isAuthenticated()` retorna `true`, guard retorna `true` |
| 181 | Usuario nao autenticado acessa rota protegida | Guard retorna `false`, `router.navigate(['/login'])` |

---

## B35. Admin Guard — protecao de rotas admin

| # | Cenario | Esperado |
|---|---------|----------|
| 182 | Usuario sem sessao acessa rota admin | Guard retorna `false`, `router.navigateByUrl('/authorization')` |
| 183 | Usuario sem ROLE_ADMIN acessa rota admin | Guard retorna `false`, `router.navigateByUrl('/app')` |
| 184 | Usuario com ROLE_ADMIN acessa rota admin | Guard retorna `true` |
| 185 | User com `roles: undefined` | `user.roles?.some(...)` retorna `undefined` (falsy), redireciona para `/app` |

---

## B36. Auth Interceptor — injecao de token

| # | Cenario | Esperado |
|---|---------|----------|
| 186 | Request para API com token JWT valido (3 partes separadas por `.`) | Header `Authorization: Bearer {token}` adicionado |
| 187 | Request para API sem token | Request passa direto, sem header Authorization |
| 188 | Token invalido (sem 3 partes com `.`) | Request passa direto, sem header (validacao `token.split('.').length !== 3`) |
| 189 | Token "null" ou "undefined" (string literal) | Request passa direto (verificacao `token === 'null' \|\| token === 'undefined'`) |
| 190 | Request para URL externa (nao comeca com apiUrl) | Request passa direto, token NAO e vazado para terceiros |
| 191 | Request para URL da API (comeca com apiUrl) | Token adicionado normalmente |
| 192 | Token com espacos nas pontas | `trim()` remove espacos antes de validar |

---

## B37. handleApiError — extracao de mensagem

| # | Cenario | Esperado |
|---|---------|----------|
| 193 | HttpErrorResponse com `error.message` | Retorna `Error(error.error.message)` |
| 194 | HttpErrorResponse com `error.error` (string) | Retorna `Error(error.error.error)` |
| 195 | HttpErrorResponse com body string | Retorna `Error(payload)` |
| 196 | HttpErrorResponse com body vazio | Retorna `Error(context)` (ex: "Erro ao fazer login") |
| 197 | Erro generico (nao HttpErrorResponse) | Retorna `Error(error.message \|\| context)` |

---

## B38. Logout — limpeza de sessao

| # | Cenario | Esperado |
|---|---------|----------|
| 198 | Chamar `authService.logout()` | `clearSession()`: remove token e user de localStorage e sessionStorage, `userSubject.next(null)` |
| 199 | Apos logout, navegacao | `router.navigate(['/authorization'])` |
| 200 | `isAuthenticated()` apos logout | Retorna `false` |

---

## B39. FormFieldComponent (shared) — comportamentos gerais

| # | Cenario | Esperado |
|---|---------|----------|
| 201 | `dynamicPlaceholder` sem valor digitado | Retorna `label` (se definido) ou `placeholder` |
| 202 | `dynamicPlaceholder` com valor digitado | Retorna `placeholder` |
| 203 | `onInput()` com mask definida | Aplica mascara via MaskService, envia valor clean para form |
| 204 | `onInput()` sem mask | Envia valor bruto para form |
| 205 | `maxlength` excedido | Trunca valor para `maxlength` caracteres |
| 206 | `blur()` chamado | Executa `onTouched()` (marca campo como touched) |
| 207 | Counter text com `showCounter = true` | Exibe "{length}/{maxlength}" |
| 208 | Counter class com 100% do limite | Classe `at-limit` |
| 209 | Counter class com 90-99% do limite | Classe `near-limit` |
| 210 | `setDisabledState(true)` | `disabled = true` |
| 211 | `writeValue(null)` | `value = ''` (fallback para string vazia) |

---

## B40. Masks Utils — funcoes puras

| # | Cenario | Esperado |
|---|---------|----------|
| 212 | `removeMask('123.456-78')` | `"12345678"` |
| 213 | `removeMask('')` | `""` |
| 214 | `removeMask(null)` | `""` (guarda `if (!value)`) |
| 215 | `applyCPFMask('12345678900')` | `"123.456.789-00"` |
| 216 | `applyCPFMask` com mais de 11 digitos | Trunca para 11 digitos, aplica mascara |
| 217 | `applyCNPJMask('12345678000190')` | `"12.345.678/0001-90"` |
| 218 | `applyPhoneMask('1134567890')` | `"(11) 3456-7890"` (fixo, 10 digitos) |
| 219 | `applyMobileMask('11987654321')` | `"(11) 98765-4321"` (celular, 11 digitos) |
| 220 | `applyPhoneMaskAuto` com 10 digitos | Usa `applyPhoneMask` |
| 221 | `applyPhoneMaskAuto` com 11 digitos | Usa `applyMobileMask` |
| 222 | `applyZipCodeMask('12345678')` | `"12345-678"` |
| 223 | `applyRGMask('123456789')` | `"12.345.678-9"` |
| 224 | `applyDateMask('01122025')` | `"01/12/2025"` |

---

## B41. NotificationService — proxies de notificacao

| # | Cenario | Esperado |
|---|---------|----------|
| 225 | `showDefault(stringMessage)` | Chama `notifications.info(stringMessage)` |
| 226 | `showDefault(objectMessage)` | Chama `notifications.showDefault(typedMessage)` |
| 227 | `warning(text)` | Chama `notifications.warning(text)` |
| 228 | `error(text)` | Chama `notifications.error(text)` |
| 229 | `success(text)` | Chama `notifications.success(text)` |
| 230 | `info(text)` | Chama `notifications.info(text)` |

---

## B42. DEFAULT_MESSAGES — constantes utilizadas nos fluxos

| # | Cenario | Esperado |
|---|---------|----------|
| 231 | REGISTRATION_SUCCESS | `type: 'success'`, text: "Cadastro concluido com sucesso!" |
| 232 | LOGIN_SUCCESS | `type: 'success'`, text: "Login realizado com sucesso!" |
| 233 | FIX_ERRORS | `type: 'warning'`, text: "Corrija os erros antes de continuar." |
| 234 | INVALID_EMAIL | `type: 'warning'`, text: "Por favor, use um email valido e profissional." |
| 235 | GENERIC_ERROR | `type: 'error'`, text: "Erro ao processar sua solicitacao. Tente novamente." |
| 236 | LOGIN_ERROR | `type: 'error'`, text: "Email ou senha incorretos. Tente novamente." |
| 237 | SESSION_EXPIRED | `type: 'error'`, text: "Sua sessao expirou. Faca login novamente." |
| 238 | INVALID_TOKEN | `type: 'error'`, text: "Link invalido ou expirado." |
| 239 | ERROR_VALIDATING_TOKEN | `type: 'error'`, text: "Erro ao validar link. Tente novamente." |
| 240 | PASSWORDS_DO_NOT_MATCH | `type: 'error'`, text: "As senhas digitadas nao sao iguais." |
| 241 | ERROR_RESETTING_PASSWORD | `type: 'error'`, text: "Erro ao redefinir senha. Tente novamente." |
| 242 | PASSWORD_CHANGED | `type: 'success'`, text: "Senha alterada com sucesso!" |

---

---
---

# FEATURE: Limite de Registros + Fila de Espera (Waitlist)

> **Objetivo:** proteger a infraestrutura AWS limitando a **100 usuarios ativos**.
> Novos cadastros alem do limite entram em **fila de espera** ate uma vaga abrir.
>
> **Responsabilidades:**
> - **Backend:** contagem de usuarios, controle de limite, fila, promocao automatica, notificacoes
> - **Frontend:** adaptar resposta do POST /auth/register e exibir UI de fila quando necessario
>
> **Importante — formato do telefone para WhatsApp (Meta API):**
> O frontend envia o telefone formatado `"(11) 98765-4321"` via `applyPhoneMaskAuto()`.
> O backend **deve** converter para E.164 antes de chamar a Meta API:
> `"(11) 98765-4321"` → `"+5511987654321"`
> Exemplo: `String e164 = "+55" + phone.replaceAll("\\D", "");`

---

## Modelo de dados sugerido (backend)

```
Tabela: users
  - id            UUID  PK
  - name          VARCHAR(100)
  - email         VARCHAR(254)  UNIQUE
  - password      VARCHAR(255)  (hash)
  - phone         VARCHAR(20)
  - status        ENUM('ACTIVE', 'QUEUED', 'DISABLED')  DEFAULT 'ACTIVE'
  - queue_position INT  NULL          -- preenchido so quando status = QUEUED
  - created_at    TIMESTAMP
  - updated_at    TIMESTAMP

Tabela: app_config
  - key           VARCHAR(50)   PK
  - value         VARCHAR(255)
  -- ex: key='MAX_ACTIVE_USERS', value='100'
```

---

## Contrato de API — endpoints novos e ajustados

### 1. POST /api/auth/register (ajuste no existente)

**Logica no backend:**
```
1. Validar dados (nome, email, senha, phone)
2. Verificar email duplicado (users.email) → 409
3. Contar usuarios com status = 'ACTIVE'
4. Se count < MAX_ACTIVE_USERS:
     → salvar user com status = 'ACTIVE'
     → gerar token JWT
     → converter phone para E.164, enviar WhatsApp welcome
     → retornar 201 com token + user
5. Se count >= MAX_ACTIVE_USERS:
     → salvar user com status = 'QUEUED', queue_position = (max + 1)
     → enviar e-mail de "voce esta na fila"
     → NAO gerar token JWT
     → retornar 202 com queued=true + position
```

**Resposta — usuario ativado (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Maria Silva",
    "email": "maria@gmail.com",
    "phone": "(11) 98765-4321",
    "status": "ACTIVE",
    "profileComplete": false,
    "roles": []
  },
  "queued": false
}
```

**Resposta — usuario na fila (202 Accepted):**
```json
{
  "token": null,
  "user": {
    "id": "uuid",
    "name": "Maria Silva",
    "email": "maria@gmail.com",
    "phone": "(11) 98765-4321",
    "status": "QUEUED",
    "profileComplete": false,
    "roles": []
  },
  "queued": true,
  "queuePosition": 5,
  "message": "Limite de usuarios atingido. Voce foi adicionado a fila de espera na posicao #5."
}
```

---

### 2. POST /api/auth/login (ajuste no existente)

**Logica adicional:**
```
Se user.status == 'QUEUED':
  → retornar 403 com mensagem especifica
```

**Resposta — usuario na fila tenta login (403 Forbidden):**
```json
{
  "error": "ACCOUNT_QUEUED",
  "message": "Sua conta esta na fila de espera. Voce sera notificado quando sua vaga for liberada.",
  "queuePosition": 5
}
```

---

### 3. GET /api/auth/registration-status (novo — publico, sem auth)

**Resposta:**
```json
{
  "open": true,
  "activeUsers": 95,
  "limit": 100,
  "queueSize": 3
}
```

Quando lotado:
```json
{
  "open": false,
  "activeUsers": 100,
  "limit": 100,
  "queueSize": 12
}
```

---

### 4. GET /api/admin/waitlist (novo — requer ROLE_ADMIN)

**Resposta:**
```json
{
  "limit": 100,
  "activeUsers": 100,
  "queue": [
    {
      "id": "uuid-1",
      "name": "Carlos Lima",
      "email": "carlos@email.com",
      "phone": "(11) 98765-4321",
      "position": 1,
      "createdAt": "2026-03-09T14:30:00Z"
    },
    {
      "id": "uuid-2",
      "name": "Ana Costa",
      "email": "ana@email.com",
      "phone": "(21) 91234-5678",
      "position": 2,
      "createdAt": "2026-03-09T15:00:00Z"
    }
  ]
}
```

---

### 5. POST /api/admin/waitlist/{userId}/activate (novo — requer ROLE_ADMIN)

Promove manualmente um usuario da fila.

**Resposta (200 OK):**
```json
{
  "message": "Usuario ativado com sucesso.",
  "user": { "id": "uuid-1", "name": "Carlos Lima", "status": "ACTIVE" }
}
```

---

### 6. DELETE /api/admin/waitlist/{userId} (novo — requer ROLE_ADMIN)

Remove usuario da fila.

**Resposta (200 OK):**
```json
{
  "message": "Usuario removido da fila."
}
```

---

### 7. PUT /api/admin/config/max-users (novo — requer ROLE_ADMIN)

**Request:**
```json
{
  "maxActiveUsers": 150
}
```

**Resposta (200 OK):**
```json
{
  "maxActiveUsers": 150,
  "activeUsers": 100,
  "promotedFromQueue": 0
}
```

Se o novo limite for maior e houver usuarios na fila, backend promove automaticamente:
```json
{
  "maxActiveUsers": 150,
  "activeUsers": 130,
  "promotedFromQueue": 30
}
```

---

### 8. DELETE /api/auth/waitlist/me (novo — publico, requer email+token ou auth basica)

Usuario cancela sua propria posicao na fila.

**Resposta (200 OK):**
```json
{
  "message": "Voce foi removido da fila de espera."
}
```

---

## Promocao automatica (backend — evento/scheduler)

```
Quando um usuario ACTIVE e desativado/removido:
  1. Contar usuarios ACTIVE
  2. Se count < MAX_ACTIVE_USERS:
       → buscar proximo QUEUED (ORDER BY queue_position ASC LIMIT 1)
       → atualizar status para ACTIVE, queue_position = NULL
       → recalcular queue_position dos restantes
       → converter phone para E.164
       → enviar WhatsApp: "Sua conta Vida Longa Flix foi ativada! Acesse: vidalongaflix.com"
       → enviar e-mail: "Sua conta foi ativada"
  3. Repetir ate count == MAX_ACTIVE_USERS ou fila vazia
```

---

## B43. Registro dentro do limite

| # | Cenario | Esperado |
|---|---------|----------|
| 243 | `POST /auth/register` com count(ACTIVE) = 50, limit = 100 | **Backend:** salva user com `status=ACTIVE`, gera token, envia WhatsApp welcome. **Response:** `201` com `queued: false` |
| 244 | `POST /auth/register` como 100o usuario (count = 99) | **Backend:** ultimo slot — `201` com `queued: false`, fluxo normal |
| 245 | **Frontend** recebe `201` com `queued: false` | Fluxo atual inalterado — `saveSession()`, notificacao "Cadastro concluido com sucesso!", redirect `/app` |

---

## B44. Fila de espera (waitlist) — registro alem do limite

| # | Cenario | Esperado |
|---|---------|----------|
| 246 | `POST /auth/register` como 101o usuario (count = 100) | **Backend:** salva user `status=QUEUED`, `queue_position=1`. **Response:** `202` com `queued: true, queuePosition: 1` |
| 247 | `POST /auth/register` como 105o (fila ja tem 4) | **Backend:** `queue_position=5`. **Response:** `202` com `queued: true, queuePosition: 5` |
| 248 | **Frontend** recebe `202` com `queued: true` | NAO chama `saveSession()`, NAO salva token. Exibe tela: "Cadastro recebido! Voce esta na posicao #5 da fila." |
| 249 | **Frontend** tela de fila mostra posicao | Mensagem: "Voce sera notificado por e-mail quando sua conta for ativada." + posicao retornada |
| 250 | **Frontend** tela de fila tem botao voltar | Botao "Voltar para o login" → `router.navigateByUrl('/authorization')` |
| 251 | **Backend** envia e-mail ao usuario na fila | E-mail: "Seu cadastro foi recebido. Voce esta na posicao #N. Avisaremos quando uma vaga abrir." |
| 252 | **Backend** persiste dados completos do usuario na fila | User salvo com todos os campos (name, email, phone, password hash) + `status=QUEUED` |
| 253 | **Backend** converte phone para E.164 mesmo na fila | Salva `phone` formatado, converte para `+55XXXXXXXXXXX` quando for enviar WhatsApp na promocao |

---

## B45. Login de usuario na fila

| # | Cenario | Esperado |
|---|---------|----------|
| 254 | `POST /auth/login` com user.status = `QUEUED` | **Backend:** `403 Forbidden` com `{ error: "ACCOUNT_QUEUED", message: "Sua conta esta na fila de espera...", queuePosition: 5 }` |
| 255 | **Frontend** recebe `403` com `error: "ACCOUNT_QUEUED"` | Notificacao warning: "Sua conta esta na fila de espera. Posicao: #5. Voce sera notificado quando for ativada." |
| 256 | `POST /auth/login` com user.status = `ACTIVE` | Fluxo normal — `200 OK` com token |
| 257 | `POST /auth/login` com user.status = `DISABLED` | **Backend:** `403 Forbidden` com `{ error: "ACCOUNT_DISABLED", message: "Sua conta foi desativada." }` |

---

## B46. Liberacao automatica da fila

| # | Cenario | Esperado |
|---|---------|----------|
| 258 | Admin desativa 1 usuario (count ACTIVE: 100 → 99) | **Backend:** busca proximo QUEUED (`queue_position=1`), muda para ACTIVE, recalcula posicoes |
| 259 | Usuario promovido recebe WhatsApp | **Backend:** converte phone → E.164 (`+5511987654321`), envia via Meta API: "Sua conta Vida Longa Flix foi ativada!" |
| 260 | Usuario promovido recebe e-mail | **Backend:** e-mail: "Sua conta foi ativada! Acesse vidalongaflix.com para fazer login." |
| 261 | Usuario promovido faz login | `POST /auth/login` → `200 OK` com token (user agora e ACTIVE) |
| 262 | 3 vagas abrem, fila tem 5 | **Backend:** promove os 3 primeiros (por `queue_position ASC`), posicoes dos 2 restantes recalculadas (1, 2) |
| 263 | Vaga abre mas fila esta vazia | **Backend:** nada acontece — proximo registro entra direto como ACTIVE |

---

## B47. Endpoint de status — GET /auth/registration-status

| # | Cenario | Esperado |
|---|---------|----------|
| 264 | Vagas disponiveis (ACTIVE=95, limit=100) | Response: `{ "open": true, "activeUsers": 95, "limit": 100, "queueSize": 3 }` |
| 265 | Lotado (ACTIVE=100, limit=100) | Response: `{ "open": false, "activeUsers": 100, "limit": 100, "queueSize": 12 }` |
| 266 | **Frontend** consulta ao carregar tela de registro | Se `open: false` → exibe banner: "Estamos com vagas limitadas. Novos cadastros entram na fila de espera." |
| 267 | **Frontend** com `open: true` | Formulario normal, sem avisos |
| 268 | Endpoint falha / timeout | **Frontend:** graceful degradation — exibe formulario normal, backend decide no POST se vai para fila |

---

## B48. Painel admin — gerenciamento da fila

| # | Cenario | Esperado |
|---|---------|----------|
| 269 | `GET /admin/waitlist` | **Backend:** retorna `{ limit, activeUsers, queue: [...] }` com lista ordenada por posicao |
| 270 | **Frontend** admin dashboard | Exibe "Usuarios ativos: 95/100" + tabela da fila (nome, e-mail, telefone, posicao, data) |
| 271 | `POST /admin/waitlist/{userId}/activate` | **Backend:** muda user para ACTIVE, envia WhatsApp + e-mail, recalcula posicoes. **Response:** `200 OK` |
| 272 | `DELETE /admin/waitlist/{userId}` | **Backend:** remove user da fila, recalcula posicoes, envia e-mail informando remocao. **Response:** `200 OK` |
| 273 | `PUT /admin/config/max-users` com `{ maxActiveUsers: 150 }` | **Backend:** atualiza limite. Se fila > 0 e novo limite > count ACTIVE → promove automaticamente. Response inclui `promotedFromQueue` |
| 274 | Admin define limite = 150, fila tem 30, ativos = 100 | **Backend:** promove 30 usuarios (100+30=130 < 150). Response: `{ promotedFromQueue: 30 }` |

---

## B49. Erros e edge cases

| # | Cenario | Esperado |
|---|---------|----------|
| 275 | Registro com e-mail duplicado (ja ACTIVE) | **Backend:** `409 Conflict` — `{ message: "Este e-mail ja esta cadastrado." }` |
| 276 | Registro com e-mail duplicado (ja na fila QUEUED) | **Backend:** `409 Conflict` — `{ message: "Este e-mail ja esta na fila de espera." }` |
| 277 | Dois usuarios tentam o 100o slot ao mesmo tempo | **Backend:** usar transacao com SELECT FOR UPDATE. Apenas 1 recebe `201`, o outro recebe `202` (fila) |
| 278 | Backend falha ao salvar na fila | **Frontend:** notificacao error: "Erro ao processar cadastro. Tente novamente." |
| 279 | Admin tenta reduzir limite para menos que usuarios ativos | **Backend:** `400 Bad Request` — `{ message: "Limite nao pode ser menor que o total de usuarios ativos (100)." }` |
| 280 | Usuario na fila tenta registrar novamente (mesmo e-mail) | **Backend:** `409 Conflict` — `{ message: "Voce ja esta na fila de espera. Posicao atual: #3." }` |
| 281 | `DELETE /auth/waitlist/me` — usuario cancela posicao | **Backend:** remove da fila, recalcula posicoes. **Response:** `200 OK` |
| 282 | `DELETE /auth/waitlist/me` — usuario nao esta na fila | **Backend:** `404 Not Found` — `{ message: "Voce nao esta na fila de espera." }` |

---

## B50. Conversao de telefone para WhatsApp (Meta API E.164)

> **Critico:** a Meta API rejeita qualquer formato que nao seja E.164.
> O backend DEVE converter antes de cada envio de WhatsApp.

| # | Cenario | Esperado |
|---|---------|----------|
| 283 | Frontend envia `phone: "(11) 98765-4321"` | **Backend:** converte → `"+5511987654321"` antes de chamar Meta API |
| 284 | Frontend envia `phone: "(21) 3456-7890"` (fixo) | **Backend:** converte → `"+552134567890"` |
| 285 | Phone salvo no banco com mascara | **Backend:** armazena formatado `"(11) 98765-4321"`, converte para E.164 somente na hora de enviar WhatsApp |
| 286 | Conversao E.164: remover nao-digitos + prefixar +55 | **Backend Java:** `String e164 = "+55" + phone.replaceAll("\\D", "");` |
| 287 | Phone com codigo de pais ja incluso (+5511...) | **Backend:** detectar se ja comeca com +55, nao duplicar prefixo |
| 288 | WhatsApp welcome no registro (user ACTIVE) | **Backend:** `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages` com `"to": "+5511987654321"` |
| 289 | WhatsApp de ativacao (user promovido da fila) | **Backend:** mesmo fluxo E.164, template: "Sua conta foi ativada!" |
| 290 | Meta API retorna erro 400 (numero invalido) | **Backend:** logar erro, NAO falhar o registro — WhatsApp e best-effort |

---

## Resumo

| Grupo | Qtd |
|-------|-----|
| B1. Authorization — renderizacao | 5 |
| B2. Authorization — rota default | 2 |
| B3. Login — renderizacao | 7 |
| B4. Login — validacao de campos | 10 |
| B5. Login — visibilidade da senha | 3 |
| B6. Login — submissao com sucesso | 5 |
| B7. Login — normalizacao de dados | 4 |
| B8. Login — tratamento de erros | 8 |
| B9. Login — sessao e persistencia | 10 |
| B10. Login — botao "Criar conta" | 1 |
| B11. Login — modal "Esqueci minha senha" | 2 |
| B12. Register — renderizacao | 9 |
| B13. Register — validacao de campos | 20 |
| B14. Register — mascara de telefone | 4 |
| B15. Register — visibilidade da senha | 3 |
| B16. Register — validacao de e-mail especial | 5 |
| B17. Register — forca da senha | 10 |
| B18. Register — submissao com sucesso | 5 |
| B19. Register — normalizacao de dados | 5 |
| B20. Register — tratamento de erros | 7 |
| B21. Register — submit com erros especificos | 5 |
| B22. Password Recovery — renderizacao | 5 |
| B23. Password Recovery — validacao | 3 |
| B24. Password Recovery — submissao com sucesso | 4 |
| B25. Password Recovery — tratamento de erros | 3 |
| B26. Password Recovery — goToLogin | 2 |
| B27. Password Recovery — EmailService | 3 |
| B28. Password Change — renderizacao e estados | 5 |
| B29. Password Change — formulario | 5 |
| B30. Password Change — validacao | 8 |
| B31. Password Change — submissao com sucesso | 4 |
| B32. Password Change — tratamento de erros | 3 |
| B33. Password Change — validacao de token | 4 |
| B34. Auth Guard | 2 |
| B35. Admin Guard | 4 |
| B36. Auth Interceptor | 7 |
| B37. handleApiError | 5 |
| B38. Logout | 3 |
| B39. FormFieldComponent | 11 |
| B40. Masks Utils | 13 |
| B41. NotificationService | 6 |
| B42. DEFAULT_MESSAGES | 12 |
| B43. Limite — registro dentro do limite | 3 |
| B44. Limite — fila de espera (waitlist) | 8 |
| B45. Limite — login de usuario na fila | 4 |
| B46. Limite — liberacao automatica da fila | 6 |
| B47. Limite — endpoint de status | 5 |
| B48. Limite — painel admin | 6 |
| B49. Limite — erros e edge cases | 8 |
| B50. Limite — conversao telefone E.164 (WhatsApp) | 8 |
| **Total** | **290** |
