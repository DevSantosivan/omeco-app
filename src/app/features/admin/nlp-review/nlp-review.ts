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
import { NlpSummary } from './nlp-review.models';
@Component({
  selector: 'app-nlp-review',
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
  templateUrl: './nlp-review.html',
  styleUrl: './nlp-review.scss',
})
export class NlpReviewComponent {
  get categoryLabels() {
    return this.distribution().map((x) => x.label);
  }
  get categoryDatasets() {
    return [{ label: 'Concerns', values: this.distribution().map((x) => x.count) }];
  }
  readonly pager = new ListPager(() => this.rows());
  readonly store = inject(AdminWorkspaceService);
  readonly query = signal('');
  readonly language = signal('All');
  readonly reviewFilter = signal('Pending');
  readonly selectedId = signal('');
  readonly message = signal('');
  readonly rows = computed(() =>
    this.store
      .incidents()
      .filter(
        (x) =>
          (x.description + ' ' + x.id).toLowerCase().includes(this.query().toLowerCase()) &&
          (this.language() === 'All' || x.language === this.language()) &&
          (this.reviewFilter() === 'All' ||
            (this.reviewFilter() === 'Pending'
              ? !x.classificationReviewed
              : x.classificationReviewed)),
      ),
  );
  readonly selected = computed(
    () => this.rows().find((x) => x.id === this.selectedId()) || this.rows()[0],
  );
  readonly summary = computed<NlpSummary>(() => ({
    pending: this.store.incidents().filter((x) => !x.classificationReviewed).length,
    reviewed: this.store.incidents().filter((x) => x.classificationReviewed).length,
    filipino: this.store.incidents().filter((x) => x.language === 'Filipino').length,
    english: this.store.incidents().filter((x) => x.language === 'English').length,
  }));
  readonly distribution = computed(() =>
    this.store.categories().map((label) => ({
      label,
      count: this.store.incidents().filter((x) => x.category === label).length,
    })),
  );
  readonly history = computed(() =>
    this.store
      .histories()
      .filter((x) => x.kind === 'Classification')
      .slice(0, 12),
  );
  tokens(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-zñ0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .join(' · ');
  }
  decide(category: string, note: string): void {
    const item = this.selected();
    if (!item) return;
    this.store.reviewCategory(item.id, category, note || 'Human reviewed simulated suggestion');
    this.message.set('Classification decision recorded for ' + item.id);
  }
}
