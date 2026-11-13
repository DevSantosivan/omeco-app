import { Component, Input } from '@angular/core';
import { OmecoCase } from '../../../models/concern';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  @Input({ required: true }) priority: OmecoCase['priority'] = 'Routine';
}
