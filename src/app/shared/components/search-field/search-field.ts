import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { IconComponent } from '../icon/icon';
@Component({
  selector: 'app-search-field',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
})
export class SearchFieldComponent implements OnDestroy {
  @Input() label = 'Search';
  @Input() placeholder = 'Search';
  @Input() value = '';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() valueChange = new EventEmitter<string>();
  private changes = new Subject<string>();
  private subscription = this.changes
    .pipe(debounceTime(250), distinctUntilChanged())
    .subscribe((value) => this.valueChange.emit(value));
  update(value: string): void {
    this.value = value;
    this.changes.next(value);
  }
  clear(): void {
    this.value = '';
    this.changes.next('');
    this.valueChange.emit('');
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
