import {
  DataTableComponent,
  TableColumn,
  TableRow,
} from '../../../shared/components/data-table/data-table';
import { PageRequest, PageResponse, paginate } from '../../../models/pagination';
import { ChartComponent } from '../../../shared/components/chart/chart';
import { ListPager } from '../../../shared/utilities/list-pager';

import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { MiniChartComponent, ChartPoint } from '../../../shared/components/mini-chart/mini-chart';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { IncidentFiltersComponent } from '../../../shared/components/incident-filters/incident-filters';
import {
  IncidentFilter,
  EMPTY_FILTER,
  filterIncidents,
} from '../../../shared/utilities/incident-filters';
import { ReportSummary } from './reports.models';
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    ChartComponent,
    DataTableComponent,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    MiniChartComponent,
    StatCardComponent,
    IncidentFiltersComponent,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent {
  readonly columns: TableColumn[] = [
    { key: 'id', label: 'Reference', sortable: true },
    { key: 'reportedAt', label: 'Reported UTC', sortable: true },
    { key: 'member', label: 'Member' },
    { key: 'location', label: 'Location' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'households', label: 'Households', sortable: true },
  ];
  readonly tableQuery = signal<PageRequest>({ page: 1, pageSize: 10 });
  readonly tableData = computed<PageResponse<TableRow>>(() => {
    const request = this.tableQuery();
    let rows = this.rows().map((x) => ({ ...x }) as TableRow);
    if (request.sortBy) {
      const key = request.sortBy;
      rows = rows.sort(
        (a, b) =>
          (typeof a[key] === 'number' && typeof b[key] === 'number'
            ? Number(a[key]) - Number(b[key])
            : String(a[key] || '').localeCompare(String(b[key] || ''))) *
          (request.sortDirection === 'desc' ? -1 : 1),
      );
    }
    return paginate(rows, { ...request, page: this.pager.result().page });
  });
  tableChange(request: PageRequest): void {
    this.tableQuery.set(request);
    this.pager.change(request);
  }

  get categoryLabels() {
    return this.categories().map((x) => x.label);
  }
  get categoryDatasets() {
    return [{ label: 'Concerns', values: this.categories().map((x) => x.count) }];
  }
  readonly pager = new ListPager(() => this.rows());
  readonly store = inject(AdminWorkspaceService);
  readonly filters = signal<IncidentFilter>({ ...EMPTY_FILTER });
  readonly message = signal('');
  readonly generatedAt = new Date();
  readonly rows = computed(() => filterIncidents(this.store.incidents(), this.filters()));
  readonly statuses = computed(() => [...new Set(this.store.incidents().map((x) => x.status))]);
  readonly summary = computed<ReportSummary>(() => ({
    incidents: this.rows().length,
    households: this.rows().reduce((n, x) => n + x.households, 0),
    critical: this.rows().filter((x) => x.priority === 'Critical').length,
    resolved: this.rows().filter((x) => /resolved|restored/i.test(x.status)).length,
  }));
  readonly monthly = computed<ChartPoint[]>(() =>
    this.store.observations(this.rows(), 'month').map((x) => ({ label: x.date, value: x.count })),
  );
  readonly categories = computed(() =>
    this.store
      .categories()
      .map((label) => ({ label, count: this.rows().filter((x) => x.category === label).length })),
  );
  exportCsv(): void {
    const headers = [
      'Reference',
      'Reported UTC',
      'Member',
      'Municipality',
      'Barangay',
      'Category',
      'Priority',
      'Status',
      'Affected households',
      'Record type',
    ];
    const data = this.rows().map((x) => [
      x.id,
      x.reportedAt || '',
      x.member,
      x.municipality || '',
      x.barangay || '',
      x.category,
      x.priority,
      x.status,
      String(x.households),
      'SIMULATED',
    ]);
    const safe = (value: string) =>
      '"' + (/^[=+@-]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
    const csv = [headers, ...data].map((row) => row.map(safe).join(',')).join('\r\n');
    const url = URL.createObjectURL(
      new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'omeco-filtered-incidents.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.store.repository.logEvent(
      'Report CSV export',
      'report',
      this.rows().length + ' currently filtered simulated incidents exported',
      this.store.actor(),
    );
    this.message.set(this.rows().length + ' filtered rows exported.');
  }
  print(): void {
    window.print();
  }
}
