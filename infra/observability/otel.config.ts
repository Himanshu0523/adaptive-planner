/**
 * OpenTelemetry Observability Configuration
 * Structured traces, metric counters, and provider outage alerting.
 */

export interface OtelConfig {
  serviceName: string;
  environment: string;
  traceExporterEndpoint?: string;
  metricExporterEndpoint?: string;
  samplingRatio: number;
}

export function getOtelConfig(): OtelConfig {
  return {
    serviceName: process.env.OTEL_SERVICE_NAME || 'adaptive-planner-backend',
    environment: process.env.NODE_ENV || 'development',
    traceExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    metricExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
    samplingRatio: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  };
}
