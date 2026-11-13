import { MemberRecordsService } from '../../../core/services/member-records.service';
import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, computed, inject, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field';
import {
  SegmentedFilterComponent,
  SegmentOption,
} from '../../../shared/components/segmented-filter/segmented-filter';
@Component({
  selector: 'app-member-reports',
  standalone: true,
  imports: [
    PaginationComponent,
    IconComponent,
    RouterLink,
    SearchFieldComponent,
    SegmentedFilterComponent,
  ],
  templateUrl: './my-reports.html',
  styleUrl: './my-reports.scss',
})
export class MemberReportsComponent {
  readonly member = inject(MemberRecordsService);
  readonly pager = new ListPager(() => this.records());
  readonly repository = inject(ConcernRepository);

  readonly filter = signal('All');
  readonly search = signal('');
  readonly options: SegmentOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Ongoing', value: 'Ongoing' },
    { label: 'Resolved', value: 'Resolved' },
  ];
  updateSearch(value: string): void {
    this.search.set(value);
    this.pager.reset();
  }
  updateFilter(value: string): void {
    this.filter.set(value);
    this.pager.reset();
  }
  readonly records = computed(() =>
    this.member
      .records()
      .filter(
        (x) =>
          (x.id + ' ' + x.category + ' ' + x.description)
            .toLowerCase()
            .includes(this.search().toLowerCase()) &&
          (this.filter() === 'All' ||
            (this.filter() === 'Resolved'
              ? /resolved|restored|complete/i.test(x.status)
              : !/resolved|restored|complete/i.test(x.status))),
      ),
  );
}
