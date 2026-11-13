import { ChartComponent } from '../../../shared/components/chart/chart';
import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { MiniChartComponent, ChartPoint } from '../../../shared/components/mini-chart/mini-chart';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { RestorationSummary } from './restoration-estimation.models';
@Component({
  selector: 'app-restoration-estimation',
  standalone: true,
  imports: [
    ChartComponent,
    PaginationComponent,
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    MiniChartComponent,
    StatCardComponent,
  ],
  templateUrl: './restoration-estimation.html',
  styleUrl: './restoration-estimation.scss',
})
export class RestorationEstimationComponent {
  get factorLabels() {
    return this.estimate()?.factors.map((x) => x.label) || [];
  }
  get factorDatasets() {
    return [{ label: 'Hours', values: this.estimate()?.factors.map((x) => x.hours) || [] }];
  }
  readonly pager = new ListPager(() => this.store.restorations());
  readonly store = inject(AdminWorkspaceService);
  readonly selectedId = signal('OC-2841');
  readonly message = signal('');
  readonly selected = computed(
    () =>
      this.store.incidents().find((x) => x.id === this.selectedId()) || this.store.incidents()[0],
  );
  readonly summary = computed<RestorationSummary>(() => {
    const x = this.selected();
    const e = x ? this.store.estimate(x) : null;
    return {
      selectedId: x?.id || '',
      estimatedHours: e?.estimatedHours || 0,
      actualHours: e?.actualHours ?? null,
    };
  });
  readonly estimate = computed(() =>
    this.selected() ? this.store.estimate(this.selected()!) : null,
  );
  readonly resolved = computed(() =>
    this.store
      .restorations()
      .filter((x) => x.actualHours !== null)
      .slice(0, 12),
  );
  readonly estimatedPoints = computed<ChartPoint[]>(() =>
    this.resolved().map((x) => ({ label: x.incidentId, value: x.estimatedHours })),
  );
  readonly actualPoints = computed<ChartPoint[]>(() =>
    this.resolved().map((x) => ({ label: x.incidentId, value: x.actualHours || 0 })),
  );
  record(): void {
    const x = this.selected();
    if (!x) return;
    this.store.repository.logEvent(
      'Restoration estimate review',
      x.id,
      'Simulated estimate ' + this.summary().estimatedHours + ' hours reviewed',
      this.store.actor(),
    );
    this.message.set('Estimate review recorded in audit trail.');
  }
}
