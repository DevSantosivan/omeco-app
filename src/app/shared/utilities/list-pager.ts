import { computed, signal } from '@angular/core';
import { PageRequest, paginate } from '../../models/pagination';
/** Cursor is associated with the current result set, resetting when filters change. */
export class ListPager<T> {
  private readonly cursor = signal({ page: 1, pageSize: 10, key: '' });
  private readonly source = computed(() => {
    const items = this.read();
    return { items, key: JSON.stringify(items) };
  });
  readonly result = computed(() => {
    const source = this.source(),
      cursor = this.cursor();
    return paginate(source.items, { ...cursor, page: cursor.key === source.key ? cursor.page : 1 });
  });
  constructor(private readonly read: () => T[]) {}
  change(request: PageRequest): void {
    this.cursor.set({ ...request, key: this.source().key });
  }
  reset(): void {
    const current = this.cursor();
    this.cursor.set({ page: 1, pageSize: current.pageSize, key: this.source().key });
  }
}
