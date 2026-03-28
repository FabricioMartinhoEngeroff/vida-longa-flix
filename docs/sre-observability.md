# SRE Observability — Metricas, Logs, Traces e Grafana

## 1. Historico de Revisoes

| Data       | Resumo da Revisao                                          | Responsavel |
|------------|------------------------------------------------------------|-------------|
| 28/03/2026 | Criacao do documento — instrumentacao do frontend com OTel  | Fabricio    |

---

## 2. Visao Geral

Este documento descreve a estrategia de observabilidade do VidaLongaFlix, cobrindo conceitos, arquitetura da stack e a implementacao concreta no frontend Angular.

**Objetivo:** rastrear de ponta a ponta a jornada do usuario — do clique no Angular, passando pela API Spring Boot, ate o banco de dados — usando um unico `trace_id` que correlaciona frontend, backend e infraestrutura.

---

## 3. Conceitos Fundamentais

### 3.1 Monitoramento vs. Observabilidade

| | Monitoramento | Observabilidade |
|---|---|---|
| Foco | Problemas conhecidos | Problemas desconhecidos |
| Abordagem | Reativa | Preditiva |
| Escopo | Componentes isolados | Sistema distribuido |
| Pergunta | "O que esta errado?" | "Por que esta errado?" |

Monitoramento acompanha sintomas ja conhecidos (CPU, memoria, disco). Observabilidade investiga problemas desconhecidos a partir das saidas do sistema (metricas, logs, traces), identificando causa e efeito antes do colapso.

### 3.2 Os Tres Pilares

Os tres pilares devem estar integrados e correlacionados — ter apenas um ou dois isolados nao e observabilidade.

**Metricas** — dados quantitativos ao longo do tempo (latencia, taxa de erros, CPU). Base para alertas e analise de tendencias. Exemplo: P95 alto indica degradacao de desempenho.

**Logs** — registros textuais de eventos do sistema. Contexto rico, mas volumosos em situacoes de erro. Boas praticas: categorizar corretamente (`ERROR`, `WARN`, `INFO`, `DEBUG`) e anexar ao trace.

**Traces** — rastreiam toda a jornada de uma requisicao de ponta a ponta entre servicos. Cada span representa uma etapa (chamada de banco, servico externo, fila). Correlacionam logs e metricas, permitindo ver o que aconteceu exatamente durante aquela requisicao.

### 3.3 Golden Signals (Google SRE)

| Sinal | O que medir | Exemplo no VidaLongaFlix |
|---|---|---|
| **Latencia** | Tempo de processamento de uma requisicao | P95 da API `/api/videos` |
| **Trafego** | Volume de requisicoes no sistema | Requisicoes/segundo por rota |
| **Erros** | Taxa de falhas (5xx, excecoes) | Aumento de erros no endpoint de login |
| **Saturacao** | Quao cheios estao os recursos | Memoria JVM > 80%, disco > 90% |

### 3.4 RED e USE

**RED** — saude dos servicos: Rate (req/s), Errors (taxa de erros), Duration (tempo de resposta).

**USE** — saude da infraestrutura: Utilization (uso de CPU/memoria), Saturation (sobrecarga), Errors (erros de infra).

### 3.5 SLI, SLO, SLA e Error Budget

| Conceito | Significado | Exemplo |
|---|---|---|
| **SLI** | Metrica real medida | 99,2% das requisicoes com < 300ms |
| **SLO** | Meta interna de desempenho | 99,5% das requisicoes com < 300ms |
| **SLA** | Contrato com o cliente | 99% de disponibilidade mensal |
| **Error Budget** | Margem tolerada para falhas | SLO 99,5% → 0,5% de budget |

### 3.6 Ciclo de Observabilidade

1. **Alerta** — threshold extrapolado (ex: latencia > 500ms)
2. **Trace** — rastrear o caminho percorrido pela requisicao
3. **Metricas + Logs** — identificar o servico lento e o impacto
4. **Decisao** — dados suficientes para implementar solucao
5. **Validacao** — manter a metrica ativa para garantir que regressoes nao passem

---

## 4. Arquitetura da Stack

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND (Angular 21)                                │
│  @opentelemetry/sdk-trace-web                         │
│  → captura: page load, chamadas HTTP, erros de JS     │
└──────────────────────┬───────────────────────────────┘
                       │ OTLP HTTP (:4318)
┌──────────────────────▼───────────────────────────────┐
│  BACKEND (Spring Boot)                                │
│  OTel Java Agent + Micrometer + Actuator              │
│  → captura: HTTP, JDBC, latencia, health checks       │
└──────────────────────┬───────────────────────────────┘
                       │ OTLP gRPC (:4317)
┌──────────────────────▼───────────────────────────────┐
│  OpenTelemetry Collector                              │
│  → filtra, enriquece, distribui                       │
└──────┬───────────────┬───────────────┬───────────────┘
       │               │               │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Mimir       │ │    Loki     │ │    Tempo    │
│ metricas    │ │    logs     │ │   traces    │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       └───────────────▼───────────────┘
                ┌──────────────┐
                │    Grafana   │
                │  dashboards  │
                │   alertas    │
                └──────────────┘
```

### O que cada camada observa

| Camada | Ferramenta | O que captura |
|---|---|---|
| Angular | OTel JS SDK | Tempo de carregamento, chamadas HTTP, erros de JS, cliques |
| Spring Boot | OTel Java Agent | Latencia de endpoints, queries SQL, erros HTTP, threads |
| Collector | OTel Collector | Centraliza tudo, filtra, enriquece com metadados |
| Metricas | Mimir | P95/P99, taxa de erros, uptime, CPU/memoria |
| Logs | Loki | Logs da JVM, logs do Angular, erros correlacionados |
| Traces | Tempo | Jornada completa: clique no Angular → API → banco |
| Visualizacao | Grafana | Dashboards, alertas, drilldown trace → log |

### Fluxo de trace ponta a ponta

> Usuario clicou em "Assistir" no Angular → chamou `/api/videos/42` → Spring Boot buscou no banco → demorou 800ms → qual query travou?

Tudo rastreavel com o mesmo `trace_id` ligando frontend, backend e banco. O header `traceparent` propaga o contexto entre servicos.

---

## 5. Implementacao no Frontend (Angular)

### 5.1 Pacotes instalados

```
@opentelemetry/api                        — API core do OpenTelemetry
@opentelemetry/sdk-trace-web              — WebTracerProvider para browser
@opentelemetry/sdk-trace-base             — BatchSpanProcessor
@opentelemetry/auto-instrumentations-web  — auto-instrumentacao (fetch, XHR, document-load, user-interaction)
@opentelemetry/exporter-trace-otlp-http   — exportador OTLP via HTTP (porta 4318 do Collector)
@opentelemetry/resources                  — identifica o servico (service.name, version, environment)
@opentelemetry/instrumentation            — registerInstrumentations()
```

### 5.2 Configuracao de ambiente

A URL do Collector e configurada por ambiente via `fileReplacements` do Angular.

**Desenvolvimento** (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
  appName: 'Vida Longa Flix',
  version: '1.0.0',
  otelCollectorUrl: 'http://localhost:4318',
};
```

**Producao** (`src/environments/environment.prod.ts`):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.vidalongaflix.com/api',
  appName: 'Vida Longa Flix',
  version: '1.0.0',
  otelCollectorUrl: '', // Grafana Cloud OTLP endpoint — configurar no Passo 9
};
```

Em producao, com URL vazia, o OTel nao inicializa (safe by default). Quando o Grafana Cloud estiver configurado, basta preencher o endpoint.

### 5.3 Arquivo de telemetria (`src/telemetry.ts`)

```typescript
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { environment } from './environments/environment';

if (environment.otelCollectorUrl) {
  const resource = resourceFromAttributes({
    'service.name': 'vidalongaflix-frontend',
    'service.version': environment.version,
    'deployment.environment': environment.production ? 'production' : 'development',
  });

  const provider = new WebTracerProvider({
    resource,
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${environment.otelCollectorUrl}/v1/traces`,
        })
      ),
    ],
  });

  provider.register();

  const apiPattern = new RegExp(escapeRegExp(environment.apiUrl));

  registerInstrumentations({
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-fetch': {
          propagateTraceHeaderCorsUrls: [apiPattern],
        },
        '@opentelemetry/instrumentation-xml-http-request': {
          propagateTraceHeaderCorsUrls: [apiPattern],
        },
      }),
    ],
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

**Explicacao dos componentes:**

| Componente | Responsabilidade |
|---|---|
| `resourceFromAttributes()` | Identifica o servico nos traces (nome, versao, ambiente) |
| `WebTracerProvider` | Gerencia a criacao e envio de spans no browser |
| `BatchSpanProcessor` | Agrupa spans em lotes antes de enviar ao Collector (reduz overhead de rede) |
| `OTLPTraceExporter` | Envia os spans via protocolo OTLP HTTP para o Collector na porta 4318 |
| `registerInstrumentations()` | Registra as auto-instrumentacoes que capturam eventos automaticamente |
| `propagateTraceHeaderCorsUrls` | Envia headers `traceparent`/`tracestate` nas requisicoes HTTP para a API, permitindo o tracing ponta a ponta |

### 5.4 Inicializacao (`src/main.ts`)

O import de `./telemetry` e a **primeira linha** do `main.ts` para garantir que o OTel inicializa antes do Angular:

```typescript
import './telemetry';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch(() => {});
```

### 5.5 O que e capturado automaticamente

A `auto-instrumentations-web` registra quatro instrumentacoes:

| Instrumentacao | O que captura |
|---|---|
| `instrumentation-document-load` | Tempo de carregamento da pagina (Navigation Timing API) |
| `instrumentation-fetch` | Todas as chamadas via Fetch API com duracao, status e URL |
| `instrumentation-xml-http-request` | Todas as chamadas via XHR com duracao, status e URL |
| `instrumentation-user-interaction` | Cliques do usuario em elementos da pagina |

Cada evento gera um **span** com `trace_id`, `span_id`, duracao e atributos. O `BatchSpanProcessor` agrupa esses spans e os envia periodicamente ao Collector.

### 5.6 Propagacao de contexto (W3C Trace Context)

Para o tracing ponta a ponta funcionar, o frontend precisa enviar o header `traceparent` nas requisicoes HTTP ao backend. A configuracao `propagateTraceHeaderCorsUrls` faz isso automaticamente para URLs que correspondem ao `apiUrl` do ambiente.

Exemplo de header propagado:
```
traceparent: 00-6a7a23cd1b2e3f4a5b6c7d8e9f0a1b2c-3d4e5f6a7b8c9d0e-01
```

O backend (OTel Java Agent) recebe esse header, continua o trace com o mesmo `trace_id` e adiciona seus proprios spans (endpoints, queries SQL). No Grafana/Tempo, toda a cadeia aparece unificada.

### 5.7 Ajustes no `angular.json`

Dois ajustes foram necessarios para acomodar os pacotes OTel:

**Budget de bundle** — aumentado de 500kB para 700kB (warning). Os pacotes OTel adicionam ~155kB ao bundle (raw), ~146kB total comprimido (transfer size). O limite de erro permanece em 1MB.

**CommonJS allowlist** — `protobufjs/minimal` e uma dependencia transitiva do `@opentelemetry/otlp-transformer` que nao possui build ESM. Adicionada em `allowedCommonJsDependencies` para suprimir o warning de build.

---

## 6. Anatomia de um Trace

Quando o usuario navega no VidaLongaFlix, o SDK gera traces compostos de spans:

```json
[
  {
    "trace_id": "6a7a23cd...",
    "span": "documentLoad",
    "service": "vidalongaflix-frontend",
    "duration_ms": 320,
    "status": "OK"
  },
  {
    "trace_id": "6a7a23cd...",
    "span": "HTTP GET /api/videos",
    "service": "vidalongaflix-frontend",
    "duration_ms": 180,
    "status": "OK"
  },
  {
    "trace_id": "6a7a23cd...",
    "span": "GET /api/videos",
    "service": "vidalongaflix-backend",
    "duration_ms": 150,
    "status": "OK"
  },
  {
    "trace_id": "6a7a23cd...",
    "span": "SELECT videos",
    "service": "vidalongaflix-backend",
    "duration_ms": 45,
    "status": "OK"
  }
]
```

| Campo | Significado |
|---|---|
| `trace_id` | Identificador unico da requisicao (mesmo entre frontend e backend) |
| `span` | Acao executada nessa etapa |
| `service` | Servico responsavel |
| `duration_ms` | Latencia da etapa em milissegundos |
| `status` | OK ou ERROR |

---

## 7. Arquivos Modificados — Resumo

| Arquivo | Alteracao |
|---|---|
| `package.json` | +7 pacotes `@opentelemetry/*` |
| `src/environments/environment.ts` | +`otelCollectorUrl: 'http://localhost:4318'` |
| `src/environments/environment.prod.ts` | +`otelCollectorUrl: ''` |
| `src/telemetry.ts` | **Novo** — configuracao do OTel SDK |
| `src/main.ts` | +`import './telemetry'` como primeira linha |
| `angular.json` | Budget 500kB → 700kB; `allowedCommonJsDependencies: ["protobufjs/minimal"]` |

---

## 8. Verificacao Local

### Pre-requisito

A stack de observabilidade (docker-compose) precisa estar rodando com o Collector expondo a porta 4318 e com CORS configurado:

```yaml
# otel-collector-config.yaml — receivers
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins: ["http://localhost:4200", "https://vidalongaflix.com"]
          allowed_headers: ["*"]
```

### Passos

1. Subir a stack: `docker compose -f docker-compose.observability.yml up -d`
2. Iniciar o frontend: `npm start`
3. Navegar no app (localhost:4200), fazer login, acessar videos
4. Abrir Grafana (localhost:3000) → Explore → Tempo
5. Buscar: `{ .service.name = "vidalongaflix-frontend" }`
6. Verificar spans de `documentLoad`, `HTTP GET`, `HTTP POST`
7. Com backend rodando: verificar que o mesmo `trace_id` aparece nos spans do frontend e do backend

---

## 9. Consultas TraceQL Uteis (Grafana Tempo)

```
# Traces lentos do frontend (> 1 segundo)
{ .service.name = "vidalongaflix-frontend" && duration > 1s }

# Traces com erro do frontend
{ .service.name = "vidalongaflix-frontend" && status = error }

# Traces lentos do backend (> 500ms)
{ .service.name = "vidalongaflix-backend" && duration > 500ms }

# Todos os spans de um trace especifico
{ .trace_id = "6a7a23cd-..." }
```

---

## 10. Proximos Passos

- [ ] Subir a stack de observabilidade local (docker-compose — Passos 1 e 2)
- [ ] Instrumentar o backend com OTel Java Agent (Passo 3 — ja feito)
- [ ] Configurar data sources no Grafana (Passo 5)
- [ ] Criar dashboards para Golden Signals (Passo 7)
- [ ] Configurar alertas (Passo 8)
- [ ] Apontar para Grafana Cloud em producao (Passo 9)
