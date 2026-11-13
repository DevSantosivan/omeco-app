import {
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MapView } from '../../../shared/components/map-view/map-view';
import { AssignmentWorkflowService } from '../../../core/services/assignment-workflow.service';
import { OmecoCase } from '../../../models/concern';
import { IconComponent } from '../../../shared/components/icon/icon';
@Component({
  selector: 'app-field-map',
  standalone: true,
  imports: [MapView, RouterLink, IconComponent],
  templateUrl: './field-map.html',
  styleUrl: './field-map.scss',
})
export class FieldMapComponent implements OnDestroy {
  private previousFocus?: HTMLElement;
  @ViewChild('sheet') set sheet(element: ElementRef<HTMLElement> | undefined) {
    if (element) {
      this.previousFocus = document.activeElement as HTMLElement;
      element.nativeElement.querySelector<HTMLButtonElement>('button')?.focus();
    } else this.previousFocus?.focus();
  }
  @HostListener('document:keydown', ['$event']) onKey(event: KeyboardEvent): void {
    if (!this.selected()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.selected.set(null);
    }
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector<HTMLElement>('.assignment-sheet');
    const controls = dialog?.querySelectorAll<HTMLElement>('button, a[href]');
    if (!controls?.length) return;
    const first = controls[0],
      last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  ngOnDestroy(): void {
    this.previousFocus?.focus();
  }

  readonly workflow = inject(AssignmentWorkflowService);
  readonly selected = signal<OmecoCase | null>(null);
  readonly active = computed(() =>
    this.workflow.assignments().filter((x) => !/complete|resolved|restored/i.test(x.status)),
  );
  readonly priority = signal('All');
  readonly scope = signal('Active');
  readonly mapped = computed(() =>
    (this.scope() === 'Active' ? this.active() : this.workflow.assignments()).filter(
      (x) => this.priority() === 'All' || x.priority === this.priority(),
    ),
  );
  navigation(item: OmecoCase): string | null {
    const c = item.coordinates;
    return c && c.every(Number.isFinite) && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90
      ? 'https://www.openstreetmap.org/directions?to=' + c[1] + ',' + c[0]
      : null;
  }
}
