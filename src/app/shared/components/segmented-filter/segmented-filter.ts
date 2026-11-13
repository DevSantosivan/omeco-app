import { Component, EventEmitter, Input, Output } from '@angular/core';
export interface SegmentOption {
  label: string;
  value: string;
  count?: number;
}
@Component({
  selector: 'app-segmented-filter',
  standalone: true,
  templateUrl: './segmented-filter.html',
  styleUrl: './segmented-filter.scss',
})
export class SegmentedFilterComponent {
  @Input({ required: true }) options: SegmentOption[] = [];
  @Input() value = '';
  @Input() label = 'Filter';
  @Output() valueChange = new EventEmitter<string>();
}
