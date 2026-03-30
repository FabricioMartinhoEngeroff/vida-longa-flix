import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
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
