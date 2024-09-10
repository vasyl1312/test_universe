import { Injectable } from '@nestjs/common';
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  public readonly httpRequestDurationHistogram: Histogram<string>;

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestDurationHistogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Histogram of HTTP request durations in seconds',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });
  }

  getMetrics() {
    return this.registry.metrics();
  }
}
