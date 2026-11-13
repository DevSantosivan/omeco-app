import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { MiniChartComponent, ChartPoint } from '../../../shared/components/mini-chart/mini-chart';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { TemporalSummary } from './temporal-trends.models';
@Component({
  selector: 'app-temporal-trends',
  standalone: true,
  imports: [
    PaginationComponent,
    ChartComponent,
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    MiniChartComponent,
    StatCardComponent,
  ],
  templateUrl: './temporal-trends.html',
  styleUrl: './temporal-trends.scss',
})
export class TemporalTrendsComponent {
  readonly pager = new ListPager(() => this.observations());
  get seasonDatasets() {
    return [{ label: 'Reports', values: [this.summary().summer, this.summary().rainy] }];
  }
  get stackedLabels() {
    return this.observations().map((x) => x.date);
  }
  get stackedDatasets() {
    return this.visibleCategories().map((category) => {
      const values = this.store.observations(
        this.filtered().filter((x) => x.category === category),
        this.period(),
      );
      return {
        label: category,
        values: this.stackedLabels.map((date) => values.find((x) => x.date === date)?.count || 0),
      };
    });
  }
  readonly store = inject(AdminWorkspaceService);
  readonly period = signal<'day' | 'week' | 'month'>('week');
  readonly category = signal('All');
  readonly municipality = signal('All');
  readonly from = signal('2026-04-01');
  readonly through = signal('2026-11-09');
  readonly method = signal('LSTM');
  readonly filtered = computed(() =>
    this.store
      .incidents()
      .filter(
        (x) =>
          (this.municipality() === 'All' || x.municipality === this.municipality()) &&
          (this.category() === 'All' || x.category === this.category()) &&
          !!x.reportedAt &&
          x.reportedAt.slice(0, 10) >= this.from() &&
          x.reportedAt.slice(0, 10) <= this.through(),
      ),
  );
  readonly visibleCategories = computed(() =>
    this.category() === 'All' ? this.store.categories() : [this.category()],
  );
  readonly observations = computed(() => this.store.observations(this.filtered(), this.period()));
  readonly points = computed<ChartPoint[]>(() =>
    this.observations()
      .slice(-18)
      .map((x) => ({ label: x.date, value: x.count })),
  );
  readonly summary = computed<TemporalSummary>(() => {
    const items = this.filtered();
    const peak = [...this.observations()].sort((a, b) => b.count - a.count)[0];
    return {
      observations: items.length,
      summer: items.filter((x) => [3, 4].includes(new Date(x.reportedAt!).getUTCMonth())).length,
      rainy: items.filter((x) =>
        [5, 6, 7, 8, 9, 10].includes(new Date(x.reportedAt!).getUTCMonth()),
      ).length,
      peak: peak?.date || 'No observations',
    };
  });
  readonly forecast = computed<ChartPoint[]>(() => {
    const history = this.store.observations(this.filtered(), 'month').slice(-4);
    const avg = history.reduce((n, x) => n + x.count, 0) / Math.max(1, history.length);
    const last = history.at(-1)?.date || '2026-11';
    return [
      ...history.map((x) => ({ label: x.date, value: x.count })),
      ...Array.from({ length: 3 }, (_, i) => {
        const d = new Date(last + '-01T00:00:00Z');
        d.setUTCMonth(d.getUTCMonth() + i + 1);
        return {
          label: d.toISOString().slice(0, 7),
          value: Math.max(
            0,
            Math.round(
              avg * (this.method() === 'LSTM' ? 1.08 : this.method() === 'SARIMA' ? 1.03 : 0.97),
            ),
          ),
          forecast: true,
        };
      }),
    ];
  });
  categoryPoints(name: string): ChartPoint[] {
    return this.store
      .observations(
        this.filtered().filter((x) => x.category === name),
        'month',
      )
      .map((x) => ({ label: x.date, value: x.count }));
  }
  changePeriod(value: string): void {
    this.period.set(value as 'day' | 'week' | 'month');
  }
}
