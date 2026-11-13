import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageRequest } from '../../../models/pagination';
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class PaginationComponent {
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly total = input(0);
  readonly changed = output<PageRequest>();
  get pages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  }
  go(page: number, pageSize = this.pageSize()): void {
    this.changed.emit({
      page: Math.max(1, Math.min(page, Math.max(1, Math.ceil(this.total() / pageSize)))),
      pageSize,
    });
  }
}
