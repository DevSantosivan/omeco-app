import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
export interface BarangayProperties {
  ADM4_EN: string;
  ADM4_PCODE: string;
  ADM3_EN: string;
  ADM2_EN: string;
}
export type BarangayCollection = FeatureCollection<Polygon | MultiPolygon, BarangayProperties>;
@Injectable({ providedIn: 'root' })
export class GeoDataService {
  private readonly http = inject(HttpClient);
  readonly data = signal<BarangayCollection | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  private pending?: Promise<BarangayCollection | null>;
  load(): Promise<BarangayCollection | null> {
    if (this.data()) return Promise.resolve(this.data());
    if (this.pending) return this.pending;
    this.loading.set(true);
    this.error.set('');
    this.pending = firstValueFrom(
      this.http.get<BarangayCollection>('/assets/geo/omeco-barangays.geojson'),
    )
      .then((data) => {
        if (
          data.type !== 'FeatureCollection' ||
          !data.features.length ||
          data.features.some((f) => !['Polygon', 'MultiPolygon'].includes(f.geometry.type))
        )
          throw Error('Invalid GeoJSON');
        this.data.set(data);
        return data;
      })
      .catch(() => {
        this.error.set(
          'Barangay boundaries could not be loaded. Incident coordinates remain available.',
        );
        return null;
      })
      .finally(() => {
        this.loading.set(false);
        this.pending = undefined;
      });
    return this.pending;
  }
}
