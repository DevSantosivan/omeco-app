import { Component, Input } from '@angular/core';
import { ChartComponent } from '../chart/chart';
import { OmecoChartDataset } from '../chart/chart.config';
export interface ChartPoint {
  label: string;
  value: number;
  forecast?: boolean;
}
@Component({
  selector: 'app-mini-chart',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './mini-chart.html',
  styleUrl: './mini-chart.scss',
})
export class MiniChartComponent {
  @Input() points: ChartPoint[] = [];
  @Input() title = 'Incident observations';
  @Input() unit = 'incidents';
  @Input() color = '#2563eb';
  get labels(): string[] {
    return this.points.map((x) => x.label);
  }
  get datasets(): OmecoChartDataset[] {
    const observed: OmecoChartDataset = {
      label: 'Historical simulated observations',
      values: this.points.map((x) => (x.forecast ? null : x.value)),
      color: this.color,
    };
    if (!this.points.some((x) => x.forecast)) return [observed];
    const first = this.points.findIndex((x) => x.forecast);
    return [
      observed,
      {
        label: 'Illustrative forecast · untrained',
        values: this.points.map((x, i) => (x.forecast || i === first - 1 ? x.value : null)),
        color: '#F59E0B',
        forecast: true,
      },
    ];
  }
}
