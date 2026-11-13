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
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { PrioritySummary } from './priority-prediction.models';
import { OmecoCase } from '../../../models/concern';
@Component({
  selector: 'app-priority-prediction',
  standalone: true,
  imports: [
    ChartComponent,
    PaginationComponent,
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
  ],
  templateUrl: './priority-prediction.html',
  styleUrl: './priority-prediction.scss',
})
export class PriorityPredictionComponent {
  get priorityDatasets() {
    return [
      {
        label: 'Concerns',
        values: [this.summary().routine, this.summary().urgent, this.summary().critical],
      },
    ];
  }
  get factorDatasets() {
    const item = this.selected();
    return [
      {
        label: 'Illustrative score',
        values: [
          item?.priority === 'Critical' ? 65 : item?.priority === 'Urgent' ? 38 : 12,
          (item?.households || 0) / 4,
        ],
      },
    ];
  }
  readonly pager = new ListPager(() => this.ranked());
  readonly store = inject(AdminWorkspaceService);
  readonly query = signal('');
  readonly filter = signal('All');
  readonly selectedId = signal('');
  readonly message = signal('');
  readonly summary = computed<PrioritySummary>(() => ({
    routine: this.store.incidents().filter((x) => x.priority === 'Routine').length,
    urgent: this.store.incidents().filter((x) => x.priority === 'Urgent').length,
    critical: this.store.incidents().filter((x) => x.priority === 'Critical').length,
  }));
  readonly ranked = computed(() =>
    this.store
      .incidents()
      .filter(
        (x) =>
          (this.filter() === 'All' || x.priority === this.filter()) &&
          (x.id + ' ' + x.category + ' ' + x.location)
            .toLowerCase()
            .includes(this.query().toLowerCase()),
      )
      .sort((a, b) => this.store.score(b) - this.store.score(a)),
  );
  readonly selected = computed(
    () => this.ranked().find((x) => x.id === this.selectedId()) || this.ranked()[0],
  );
  readonly history = computed(() =>
    this.store
      .histories()
      .filter((x) => x.kind === 'Priority')
      .slice(0, 12),
  );
  decide(priority: string, note: string): void {
    const x = this.selected();
    if (!x) return;
    if (priority !== x.priority && !note.trim()) {
      this.message.set('Enter a reason before overriding priority.');
      return;
    }
    this.store.reviewPriority(
      x.id,
      priority as OmecoCase['priority'],
      note || 'Human confirmed illustrative priority',
    );
    this.message.set('Priority review saved for ' + x.id);
  }
}
