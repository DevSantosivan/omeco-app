import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IconComponent } from '../icon/icon';
@Component({
  selector: 'app-data-state',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './data-state.html',
  styleUrl: './data-state.scss',
})
export class DataStateComponent {
  @Input() loading = false;
  @Input() error = '';
  @Input() empty = false;
  @Output() retry = new EventEmitter<void>();
}
