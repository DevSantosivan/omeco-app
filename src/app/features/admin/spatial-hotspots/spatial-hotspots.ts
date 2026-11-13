import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { GisRiskService } from '../../../core/services/gis-risk.service';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { RISK_CONFIG } from '../../../core/config/risk';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { MapView } from '../../../shared/components/map-view/map-view';
import { IncidentFiltersComponent } from '../../../shared/components/incident-filters/incident-filters';
import {
  IncidentFilter,
  EMPTY_FILTER,
  filterIncidents,
} from '../../../shared/utilities/incident-filters';
import { SpatialSummary } from './spatial-hotspots.models';
@Component({
  selector: 'app-spatial-hotspots',
  standalone: true,
  imports: [
    PaginationComponent,
    ChartComponent,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
    MapView,
    IncidentFiltersComponent,
  ],
  templateUrl: './spatial-hotspots.html',
  styleUrl: './spatial-hotspots.scss',
})
export class SpatialHotspotsComponent {
  readonly pager = new ListPager(() => this.hotspots());
  readonly risk = inject(GisRiskService);
  readonly riskLabels = RISK_CONFIG.map((x) => x.level);
  get riskDatasets() {
    return [
      {
        label: 'Barangays',
        colors: RISK_CONFIG.map((x) => x.color),
        values: RISK_CONFIG.map(
          (r) =>
            this.store.geography.filter((g) => this.risk.forBarangay(g.code).level === r.level)
              .length,
        ),
      },
    ];
  }
  readonly store = inject(AdminWorkspaceService);
  readonly filters = signal<IncidentFilter>({ ...EMPTY_FILTER });
  readonly selectedCode = signal('');
  readonly rows = computed(() => filterIncidents(this.store.incidents(), this.filters()));
  readonly hotspots = computed(() => this.store.groupHotspots(this.rows()));
  readonly summary = computed<SpatialSummary>(() => ({
    barangays: this.hotspots().length,
    recurrent: this.hotspots().filter((x) => x.recurrence > 0).length,
    incidents: this.rows().length,
  }));
  readonly selected = computed(() => {
    const code = this.selectedCode() || this.hotspots()[0]?.code;
    const row = this.hotspots().find((x) => x.code === code);
    if (row) return row;
    const g = this.store.geography.find((x) => x.code === code);
    return g ? { ...g, incidents: 0, households: 0, critical: 0, recurrence: 0 } : null;
  });
}
