import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { MapView } from '../../../shared/components/map-view/map-view';
import { DispatchSummary } from './dispatch.models';
@Component({
  selector: 'app-dispatch',
  standalone: true,
  imports: [
    PaginationComponent,
    FormsModule,
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    DataStateComponent,
    IconComponent,
    MapView,
  ],
  templateUrl: './dispatch.html',
  styleUrl: './dispatch.scss',
})
export class DispatchComponent {
  readonly pager = new ListPager(() => this.queue());
  readonly store = inject(AdminWorkspaceService);
  readonly repository = this.store.repository;
  readonly crews = this.repository.crews;
  readonly selectedId = signal('');
  readonly crewId = signal('');
  readonly pending = signal(false);
  readonly message = signal('');
  readonly queue = computed(() => this.repository.concerns().filter((x) => !x.assignedCrew));
  readonly selected = computed(
    () => this.queue().find((x) => x.id === this.selectedId()) || this.queue()[0],
  );
  readonly selectedCrew = computed(() => this.crews().find((x) => x.id === this.crewId()));
  readonly summary = computed<DispatchSummary>(() => ({
    pending: this.queue().length,
    available: this.crews().filter((x) => x.available).length,
    assigned: this.repository.concerns().filter((x) => !!x.assignedCrew).length,
  }));
  readonly connections = computed(() => {
    const item = this.selected(),
      crew = this.selectedCrew();
    return item ? [{ ...item, assignedCrew: crew?.name || item.assignedCrew }] : [];
  });
  approve(): void {
    const item = this.selected(),
      crew = this.selectedCrew();
    if (!item || !crew || !crew.available) return;
    this.repository.update(item.id, { assignedCrew: crew.name, status: 'Dispatched' });
    this.repository.logEvent(
      'Dispatch approval',
      item.id,
      'Dispatcher approved ' + crew.name + ' · expertise ' + crew.expertise,
      this.store.actor(),
    );
    this.pending.set(false);
    this.message.set(item.id + ' dispatched to ' + crew.name + ' after human approval.');
    this.crewId.set('');
  }
}
