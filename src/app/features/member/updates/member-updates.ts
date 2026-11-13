import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnnouncementService } from '../../../core/services/announcement.service';
import { SearchFieldComponent } from '../../../shared/components/search-field/search-field';
import {
  SegmentedFilterComponent,
  SegmentOption,
} from '../../../shared/components/segmented-filter/segmented-filter';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ListPager } from '../../../shared/utilities/list-pager';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';
@Component({
  selector: 'app-member-updates',
  standalone: true,
  imports: [
    RouterLink,
    SearchFieldComponent,
    SegmentedFilterComponent,
    IconComponent,
    PaginationComponent,
  ],
  templateUrl: './member-updates.html',
  styleUrl: './member-updates.scss',
})
export class MemberUpdatesComponent {
  readonly announcements = inject(AnnouncementService);
  readonly search = signal('');
  readonly filter = signal('All');
  readonly readFilter = signal('All');
  readonly sortOrder = signal('Newest');
  readonly options: SegmentOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Interruptions', value: 'Interruption' },
    { label: 'Restoration', value: 'Restoration' },
    { label: 'Advisories', value: 'Outage advisory' },
    { label: 'Maintenance', value: 'Maintenance' },
    { label: 'General', value: 'General' },
  ];
  readonly rows = computed(() =>
    this.announcements
      .records()
      .filter(
        (x) =>
          (this.filter() === 'All' || x.type === this.filter()) &&
          (this.readFilter() === 'All' ||
            this.announcements.isRead(x.id) === (this.readFilter() === 'Read')) &&
          (x.title + ' ' + x.summary + ' ' + x.description)
            .toLowerCase()
            .includes(this.search().toLowerCase()),
      )
      .sort(
        (a, b) =>
          (Date.parse(a.publishedAt.replace(' · ', ' ')) -
            Date.parse(b.publishedAt.replace(' · ', ' '))) *
          (this.sortOrder() === 'Newest' ? -1 : 1),
      ),
  );
  readonly pager = new ListPager(() => this.rows());
  updateSearch(value: string): void {
    this.search.set(value);
    this.pager.reset();
  }
  updateFilter(value: string): void {
    this.filter.set(value);
    this.pager.reset();
  }
}
