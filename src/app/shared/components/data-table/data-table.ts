import { Component, input, output } from '@angular/core';
import { PaginationComponent } from '../pagination/pagination';
import { PageRequest, PageResponse } from '../../../models/pagination';
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}
export interface TableRow {
  id: string;
  [key: string]: unknown;
}
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [PaginationComponent],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTableComponent {
  readonly columns = input<TableColumn[]>([]);
  readonly data = input.required<PageResponse<TableRow>>();
  readonly loading = input(false);
  readonly error = input('');
  readonly actions = input<string[]>([]);
  readonly requested = output<PageRequest>();
  readonly retry = output<void>();
  readonly action = output<{ action: string; row: TableRow }>();
  query: PageRequest = { page: 1, pageSize: 10 };
  request(q: Partial<PageRequest>): void {
    this.query = { ...this.query, ...q };
    this.requested.emit(this.query);
  }
  sort(column: TableColumn): void {
    if (column.sortable)
      this.request({
        page: 1,
        sortBy: column.key,
        sortDirection:
          this.query.sortBy === column.key && this.query.sortDirection === 'asc' ? 'desc' : 'asc',
      });
  }
}
