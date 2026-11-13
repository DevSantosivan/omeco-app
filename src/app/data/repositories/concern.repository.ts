import { Signal } from '@angular/core';
import { OmecoCase } from '../../models/concern';
import { DemoActivityPoint } from '../mock/operations';
import { AuditEvent, Crew } from '../../models/admin';
import { Observable, defer, of } from 'rxjs';

export abstract class ConcernRepository {
  abstract readonly concerns: Signal<OmecoCase[]>;
  abstract readonly loading: Signal<boolean>;
  abstract readonly activity: Signal<DemoActivityPoint[]>;
  abstract readonly crews: Signal<Crew[]>;
  abstract readonly audit: Signal<AuditEvent[]>;
  abstract readonly error: Signal<string>;
  abstract logEvent(action: string, recordId: string, detail: string, actor?: string): void;
  abstract recover(): void;
  abstract add(record: OmecoCase): void;
  create(record: OmecoCase): Observable<OmecoCase> {
    return defer(() => {
      this.add(record);
      return of(this.findById(record.id) || record);
    });
  }
  abstract update(id: string, changes: Partial<OmecoCase>): void;
  abstract findById(id: string): OmecoCase | undefined;
}
