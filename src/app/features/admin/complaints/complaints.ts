import { WorkspaceRepository } from '../../../data/repositories/workspace.repository';
import { pagedResource } from '../../../shared/utilities/paged-resource';
import { PageRequest } from '../../../models/pagination';
import { IncidentFiltersComponent } from '../../../shared/components/incident-filters/incident-filters';
import { EMPTY_FILTER, IncidentFilter } from '../../../shared/utilities/incident-filters';
import { BARANGAYS } from '../../../data/mock/geography';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, computed, signal, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { MapView } from '../../../shared/components/map-view/map-view';
@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [
    IncidentFiltersComponent,
    PaginationComponent,
    FormsModule,
    IconComponent,
    RouterLink,
    PageHeaderComponent,
    MapView,
  ],
  templateUrl: './complaints.html',
  styleUrl: './complaints.scss',
})
export class AdminComplaintsComponent {
  readonly repository = inject(ConcernRepository);

  readonly query = signal('');
  readonly filters = signal<IncidentFilter>({ ...EMPTY_FILTER });
  readonly places = BARANGAYS;
  readonly municipalities = [...new Set(BARANGAYS.map((x) => x.municipality))];
  readonly categories = computed(() => [
    ...new Set(this.repository.concerns().map((x) => x.category)),
  ]);
  readonly statuses = computed(() => [...new Set(this.repository.concerns().map((x) => x.status))]);
  readonly priority = signal('All');
  readonly nextRetry = (n: number) => n + 1;
  readonly selectedId = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly retryKey = signal(0);
  readonly api = inject(WorkspaceRepository);
  private readonly requestKey = computed(() =>
    JSON.stringify([this.filters(), this.query(), this.priority()]),
  );
  private previousKey = signal('');
  readonly request = computed(() => {
    const key = this.requestKey();
    return {
      key,
      revision: this.repository.concerns(),
      retry: this.retryKey(),
      query: {
        ...this.filters(),
        municipality: this.filters().municipality === 'All' ? '' : this.filters().municipality,
        barangay: this.filters().barangay === 'All' ? '' : this.filters().barangay,
        category: this.filters().category === 'All' ? '' : this.filters().category,
        priority:
          this.priority() === 'All'
            ? this.filters().priority === 'All'
              ? ''
              : this.filters().priority
            : this.priority(),
        status: this.filters().status === 'All' ? '' : this.filters().status,
        search: this.query(),
        page: key === this.previousKey() ? this.page() : 1,
        pageSize: this.pageSize(),
      },
    };
  });
  readonly resource = pagedResource(this.request, (request) => this.api.complaints(request.query));
  changePage(request: PageRequest): void {
    this.previousKey.set(this.requestKey());
    this.page.set(request.page);
    this.pageSize.set(request.pageSize);
  }
  readonly selected = computed(
    () => this.filtered().find((item) => item.id === this.selectedId()) ?? this.filtered()[0],
  );
  readonly filtered = computed(() => this.resource().data?.items || []);
}
