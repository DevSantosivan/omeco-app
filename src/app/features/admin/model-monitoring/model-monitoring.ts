import { FormsModule } from '@angular/forms';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { ModelSummary, DemoInference } from './model-monitoring.models';
@Component({
  selector: 'app-model-monitoring',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
  ],
  templateUrl: './model-monitoring.html',
  styleUrl: './model-monitoring.scss',
})
export class ModelMonitoringComponent {
  readonly store = inject(AdminWorkspaceService);
  readonly selectedId = signal('nlp');
  readonly incidentId = signal('OC-2841');
  readonly running = signal(false);
  readonly message = signal('');
  readonly selected = computed(
    () => this.store.models.find((x) => x.id === this.selectedId()) || this.store.models[0],
  );
  readonly summary = computed<ModelSummary>(() => ({
    models: this.store.models.length,
    trained: 0,
    records: this.store.incidents().length,
    reviewed: this.store.incidents().filter((x) => x.classificationReviewed).length,
  }));
  readonly history = computed<DemoInference[]>(() => [
    ...this.store.repository
      .audit()
      .filter((x) => x.action === 'Model demonstration')
      .map((x) => ({
        id: x.id,
        timestamp: x.timestamp,
        model: x.detail.split(':')[0],
        recordId: x.recordId,
        output: x.detail,
        seeded: false,
      })),
    ...this.store
      .incidents()
      .slice(0, 4)
      .map((x, i) => ({
        id: 'inference-seed-' + i,
        timestamp: x.reportedAt || '',
        model: this.store.models[i].name,
        recordId: x.id,
        output: 'Seeded UI output: ' + x.category + ' · ' + x.priority,
        seeded: true,
      })),
  ]);
  run(): void {
    const item = this.store.repository.findById(this.incidentId());
    if (!item) return;
    this.running.set(true);
    setTimeout(() => {
      this.store.repository.logEvent(
        'Model demonstration',
        item.id,
        this.selected().name +
          ': deterministic UI sample only; ' +
          item.category +
          ' / ' +
          item.priority,
        this.store.actor(),
      );
      this.running.set(false);
      this.message.set(
        'Interface demonstration completed. No trained model inference was performed.',
      );
    }, 300);
  }
}
