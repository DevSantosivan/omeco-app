import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { IncidentMapSummary } from './incident-map.models';
import { GeographySelection } from '../../../models/admin';
@Component({
  selector: 'app-incident-map',
  standalone: true,
  imports: [
    PaginationComponent,
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
    MapView,
    IncidentFiltersComponent,
  ],
  templateUrl: './incident-map.html',
  styleUrl: './incident-map.scss',
})
export class IncidentMapComponent {
  readonly pager = new ListPager(() => this.rows());
  readonly store = inject(AdminWorkspaceService);
  readonly filters = signal<IncidentFilter>({ ...EMPTY_FILTER });
  readonly selectedId = signal('');
  readonly boundary = signal<GeographySelection | null>(null);
  readonly rows = computed(() => filterIncidents(this.store.incidents(), this.filters()));
  readonly selected = computed(
    () => this.rows().find((x) => x.id === this.selectedId()) || this.rows()[0],
  );
  readonly summary = computed<IncidentMapSummary>(() => ({
    incidents: this.rows().length,
    households: this.rows().reduce((n, x) => n + x.households, 0),
    missingCoordinates: this.rows().filter((x) => !x.coordinates).length,
  }));
  select(id: string): void {
    this.selectedId.set(id);
  }
}
