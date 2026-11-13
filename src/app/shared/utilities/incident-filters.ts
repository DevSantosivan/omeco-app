import { OmecoCase } from '../../models/concern';
export interface IncidentFilter {
  municipality: string;
  barangay: string;
  category: string;
  priority: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}
export const EMPTY_FILTER: IncidentFilter = {
  municipality: 'All',
  barangay: 'All',
  category: 'All',
  priority: 'All',
  status: 'All',
  dateFrom: '',
  dateTo: '',
};
export function filterIncidents(items: OmecoCase[], filter: IncidentFilter): OmecoCase[] {
  return items.filter(
    (x) =>
      (filter.municipality === 'All' || x.municipality === filter.municipality) &&
      (filter.barangay === 'All' || x.barangayCode === filter.barangay) &&
      (filter.category === 'All' || x.category === filter.category) &&
      (filter.priority === 'All' || x.priority === filter.priority) &&
      (filter.status === 'All' || x.status === filter.status) &&
      (!filter.dateFrom || (!!x.reportedAt && x.reportedAt.slice(0, 10) >= filter.dateFrom)) &&
      (!filter.dateTo || (!!x.reportedAt && x.reportedAt.slice(0, 10) <= filter.dateTo)),
  );
}
