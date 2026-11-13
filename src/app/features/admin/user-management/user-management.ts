import { PaginationComponent } from '../../../shared/components/pagination/pagination';
import { ListPager } from '../../../shared/utilities/list-pager';
import { FormsModule } from '@angular/forms';
import { Component, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkspaceService } from '../../../core/services/admin-workspace.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
import { DataStateComponent } from '../../../shared/components/data-state/data-state';
import { IconComponent } from '../../../shared/components/icon/icon';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { DirectorySummary } from './user-management.models';
import { DemoUser } from '../../../models/admin';
import { UserRole } from '../../../models/auth';
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    PaginationComponent,
    FormsModule,
    CommonModule,
    PageHeaderComponent,
    DataStateComponent,
    IconComponent,
    StatCardComponent,
  ],
  templateUrl: './user-management.html',
  styleUrl: './user-management.scss',
})
export class UserManagementComponent {
  readonly store = inject(AdminWorkspaceService);
  readonly query = signal('');
  readonly role = signal('All');
  readonly status = signal('All');
  readonly currentPage = signal(1);
  readonly selectedId = signal('');
  readonly pending = signal<DemoUser | null>(null);
  readonly message = signal('');
  readonly pager = new ListPager(() => this.filtered());
  readonly summary = computed<DirectorySummary>(() => ({
    total: this.store.users().length,
    members: this.store.users().filter((x) => x.role === 'member').length,
    staff: this.store.users().filter((x) => x.role === 'field-worker').length,
    admins: this.store.users().filter((x) => x.role === 'admin').length,
  }));
  readonly filtered = computed(() =>
    this.store
      .users()
      .filter(
        (x) =>
          (x.name + ' ' + x.email + ' ' + x.municipality)
            .toLowerCase()
            .includes(this.query().toLowerCase()) &&
          (this.role() === 'All' || x.role === this.role()) &&
          (this.status() === 'All' || x.active === (this.status() === 'Active')),
      ),
  );
  readonly rows = computed(() => this.pager.result().items);
  readonly selected = computed(
    () => this.store.users().find((x) => x.id === this.selectedId()) || this.rows()[0],
  );
  changeFilter(kind: string, value: string): void {
    if (kind === 'query') this.query.set(value);
    if (kind === 'role') this.role.set(value);
    if (kind === 'status') this.status.set(value);
    this.currentPage.set(1);
  }
  requestRole(role: string): void {
    const user = this.selected();
    if (user) this.pending.set({ ...user, role: role as UserRole });
  }
  requestStatus(): void {
    const user = this.selected();
    if (user) this.pending.set({ ...user, active: !user.active });
  }
  confirm(): void {
    const user = this.pending();
    if (!user) return;
    this.store.updateUser(user);
    this.pending.set(null);
    this.message.set('Demo account updated: ' + user.name);
  }
}
