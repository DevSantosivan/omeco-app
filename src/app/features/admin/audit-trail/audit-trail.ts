import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { AuditSummary } from './audit-trail.models';
@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [
    PaginationComponent,
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
  ],
  templateUrl: './audit-trail.html',
  styleUrl: './audit-trail.scss',
})
export class AuditTrailComponent {
  readonly pager = new ListPager(() => this.events());
  readonly store = inject(AdminWorkspaceService);
  readonly actor = signal('All');
  readonly action = signal('All');
  readonly from = signal('');
  readonly through = signal('');
  readonly query = signal('');
  readonly selectedId = signal('');
  readonly actors = computed(() => [...new Set(this.store.repository.audit().map((x) => x.actor))]);
  readonly actions = computed(() => [
    ...new Set(this.store.repository.audit().map((x) => x.action)),
  ]);
  readonly events = computed(() =>
    this.store.repository
      .audit()
      .filter(
        (x) =>
          (this.actor() === 'All' || x.actor === this.actor()) &&
          (this.action() === 'All' || x.action === this.action()) &&
          (!this.from() || x.timestamp.slice(0, 10) >= this.from()) &&
          (!this.through() || x.timestamp.slice(0, 10) <= this.through()) &&
          (x.recordId + ' ' + x.detail).toLowerCase().includes(this.query().toLowerCase()),
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  );
  readonly summary = computed<AuditSummary>(() => ({
    total: this.events().length,
    actual: this.events().filter((x) => !x.seeded).length,
    seeded: this.events().filter((x) => x.seeded).length,
  }));
  readonly selected = computed(
    () => this.events().find((x) => x.id === this.selectedId()) || this.events()[0],
  );
}
