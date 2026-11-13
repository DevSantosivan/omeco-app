import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { PageResponse } from '../../models/pagination';
export interface PageState<T> {
  data: PageResponse<T> | null;
  loading: boolean;
  error: string;
}
/** switchMap unsubscribes stale HTTP requests; loading/error state belongs to each request. */
export function pagedResource<Q, T>(
  query: Signal<Q>,
  load: (query: Q) => Observable<PageResponse<T>>,
): Signal<PageState<T>> {
  return toSignal(
    toObservable(query).pipe(
      debounceTime(250),
      switchMap((q) =>
        load(q).pipe(
          map((data) => ({ data, loading: false, error: '' })),
          catchError(() =>
            of({
              data: null,
              loading: false,
              error: 'Records could not be loaded. Retry or change filters.',
            }),
          ),
          startWith({ data: null, loading: true, error: '' }),
        ),
      ),
    ),
    { initialValue: { data: null, loading: true, error: '' } },
  );
}
