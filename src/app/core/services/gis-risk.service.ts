import { Injectable, computed, inject } from '@angular/core';
import { ConcernRepository } from '../../data/repositories/concern.repository';
import { assessRisk } from '../config/risk';
@Injectable({ providedIn: 'root' })
export class GisRiskService {
  private readonly repository = inject(ConcernRepository);
  readonly summaries = computed(() => {
    const groups = new Map<string, ReturnType<typeof this.repository.concerns>>();
    for (const item of this.repository.concerns()) {
      if (item.barangayCode)
        groups.set(item.barangayCode, [...(groups.get(item.barangayCode) || []), item]);
    }
    return new Map([...groups].map(([code, items]) => [code, assessRisk(items)]));
  });
  forBarangay(code: string) {
    return this.summaries().get(code) || assessRisk([]);
  }
}
