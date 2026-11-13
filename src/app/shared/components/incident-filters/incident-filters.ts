import { FormsModule } from '@angular/forms';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IncidentFilter, EMPTY_FILTER } from '../../utilities/incident-filters';
export interface PlaceOption {
  code: string;
  barangay: string;
  municipality: string;
}
@Component({
  selector: 'app-incident-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './incident-filters.html',
  styleUrl: './incident-filters.scss',
})
export class IncidentFiltersComponent {
  @Input() value: IncidentFilter = EMPTY_FILTER;
  @Input() municipalities: readonly string[] = [];
  @Input() places: readonly PlaceOption[] = [];
  @Input() categories: string[] = [];
  @Input() dates = false;
  @Input() statuses: string[] = [];
  @Output() changed = new EventEmitter<IncidentFilter>();
  get barangays(): readonly PlaceOption[] {
    return this.places.filter(
      (x) => this.value.municipality === 'All' || x.municipality === this.value.municipality,
    );
  }
  change(key: keyof IncidentFilter, value: string): void {
    this.changed.emit({
      ...this.value,
      [key]: value,
      ...(key === 'municipality' ? { barangay: 'All' } : {}),
    });
  }
  clear(): void {
    this.changed.emit({ ...EMPTY_FILTER });
  }
}
