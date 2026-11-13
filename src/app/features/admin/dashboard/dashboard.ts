import { ChartComponent } from '../../../shared/components/chart/chart';
import { MiniChartComponent, ChartPoint } from '../../../shared/components/mini-chart/mini-chart';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { MapView } from '../../../shared/components/map-view/map-view';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    ChartComponent,
    MiniChartComponent,
    CommonModule,
    MapView,
    IconComponent,
    RouterLink,
    StatCardComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboardComponent {
  get categoryLabels() {
    return this.categories.map((x) => x.label);
  }
  get categoryDatasets() {
    return [{ label: 'Concerns', values: this.categories.map((x) => x.count) }];
  }
  readonly repository = inject(ConcernRepository);
  get pendingPreview() {
    return this.repository
      .concerns()
      .filter((x) => !x.assignedCrew)
      .slice(0, 5);
  }

  get chartRows() {
    return this.repository.activity();
  }
  get availableCrews(): number {
    return this.repository.crews().filter((x) => x.available).length;
  }
  get ongoing(): number {
    return this.repository.concerns().filter((x) => /progress|repair/i.test(x.status)).length;
  }
  get restored(): number {
    return this.repository.concerns().filter((x) => /resolved|restored|complete/i.test(x.status))
      .length;
  }
  get crewCount(): number {
    return new Set(
      this.repository
        .concerns()
        .map((x) => x.assignedCrew)
        .filter(Boolean),
    ).size;
  }
  get areas(): number {
    return new Set(this.repository.concerns().map((x) => x.location)).size;
  }
  get categories() {
    const items = this.repository.concerns();
    return [...new Set(items.map((x) => x.category))].map((label, index) => ({
      label,
      count: items.filter((x) => x.category === label).length,
      color: ['#2563eb', '#f59e0b', '#ef6464', '#16a36a', '#8b5cf6'][index % 5],
    }));
  }
  get trendChartPoints(): ChartPoint[] {
    return this.chartRows.map((x) => ({ label: x.label, value: x.value }));
  }
  get trendPoints(): string {
    return this.chartRows.map((x, i) => i * 80 + 20 + ',' + (165 - x.value * 1.5)).join(' ');
  }
  get criticalCount(): string {
    return String(this.repository.concerns().filter((item) => item.priority === 'Critical').length);
  }
  get awaitingCount(): string {
    return String(this.repository.concerns().filter((item) => !item.assignedCrew).length);
  }
  get householdCount(): string {
    return String(this.repository.concerns().reduce((total, item) => total + item.households, 0));
  }
}
