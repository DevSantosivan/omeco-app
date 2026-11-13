import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class IconComponent {
  @Input() name = 'circle';
  @Input() size = 20;
}
