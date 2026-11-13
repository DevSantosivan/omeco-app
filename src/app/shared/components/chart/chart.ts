import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ThemeService } from '../../../core/services/theme.service';
import { CHART_COLORS, OmecoChartDataset, OmecoChartKind } from './chart.config';
Chart.register(...registerables);
@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() datasets: OmecoChartDataset[] = [];
  @Input() kind: OmecoChartKind = 'line';
  @Input() title = 'Incident chart';
  @Input() loading = false;
  @Input() error = '';
  @Input() unit = 'incidents';
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private ready = false;
  readonly theme = inject(ThemeService);
  constructor() {
    effect(() => {
      this.theme.mode();
      if (this.ready) this.render();
    });
  }
  get empty(): boolean {
    return !this.labels.length || !this.datasets.some((x) => x.values.some((v) => v !== null));
  }
  get summary(): string {
    return this.datasets
      .map(
        (x) =>
          x.label +
          ': ' +
          this.labels.map((l, i) => l + ' ' + (x.values[i] ?? 'unavailable')).join(', '),
      )
      .join('. ');
  }
  ngAfterViewInit(): void {
    this.ready = true;
    this.render();
    window.addEventListener('beforeprint', this.beforePrint);
    window.addEventListener('afterprint', this.afterPrint);
  }
  ngOnChanges(): void {
    if (this.ready) this.render();
  }
  ngOnDestroy(): void {
    this.chart?.destroy();
    window.removeEventListener('beforeprint', this.beforePrint);
    window.removeEventListener('afterprint', this.afterPrint);
  }
  private beforePrint = () => this.chart?.resize(600, 300);
  private afterPrint = () => this.chart?.resize();
  private render(): void {
    this.chart?.destroy();
    this.chart = undefined;
    if (this.loading || this.error || this.empty) return;
    const dark = this.theme.mode() === 'dark',
      text = dark ? '#CBD5E1' : '#64748B',
      grid = dark ? '#334155' : '#E2E8F0';
    const doughnut = this.kind === 'doughnut';
    const config: ChartConfiguration = {
      type: doughnut ? 'doughnut' : this.kind === 'line' ? 'line' : 'bar',
      data: {
        labels: this.labels,
        datasets: this.datasets.map((d, i) => ({
          label: d.label,
          data: d.values,
          borderColor: d.color || CHART_COLORS[i % CHART_COLORS.length],
          backgroundColor:
            d.colors ||
            (doughnut ? CHART_COLORS : d.color || CHART_COLORS[i % CHART_COLORS.length]),
          borderWidth: 2,
          borderDash: d.forecast ? [6, 4] : [],
          pointRadius: 3,
          tension: 0.25,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? false
          : { duration: 200 },
        indexAxis: this.kind === 'horizontalBar' ? 'y' : 'x',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: text,
              font: { family: 'DM Sans Variable, sans-serif', size: 11 },
              boxWidth: 12,
            },
          },
          tooltip: { enabled: true },
        },
        scales: doughnut
          ? {}
          : {
              x: {
                stacked: this.kind === 'stackedBar',
                grid: { color: grid },
                ticks: {
                  color: text,
                  maxTicksLimit: 6,
                  font: { family: 'DM Sans Variable, sans-serif', size: 10 },
                },
              },
              y: {
                stacked: this.kind === 'stackedBar',
                beginAtZero: true,
                title: { display: true, text: this.unit, color: text },
                grid: { color: grid },
                ticks: { color: text, precision: 0 },
              },
            },
      },
    };
    this.chart = new Chart(this.canvas.nativeElement, config);
  }
}
