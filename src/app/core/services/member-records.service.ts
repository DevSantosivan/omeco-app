import { Injectable, computed, inject } from '@angular/core';
import { AuthPort } from '../../models/auth';
import { ConcernRepository } from '../../data/repositories/concern.repository';
@Injectable({ providedIn: 'root' })
export class MemberRecordsService {
  readonly auth = inject(AuthPort);
  readonly repository = inject(ConcernRepository);
  readonly records = computed(() =>
    this.repository.concerns().filter((x) => x.member === this.auth.session()?.name),
  );
  readonly updates = computed(() => {
    const ids = new Set(this.records().map((x) => x.id));
    return this.repository
      .audit()
      .filter((x) => ids.has(x.recordId) && !x.detail.startsWith('{'))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  });
}
