import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./features/auth/access-denied/access-denied').then((m) => m.AccessDeniedPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'admin' },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./features/admin/complaints/complaints').then((m) => m.AdminComplaintsComponent),
      },
      {
        path: 'complaints/:id',
        loadComponent: () =>
          import('./features/admin/complaints/complaint-detail').then(
            (m) => m.AdminComplaintDetailComponent,
          ),
      },
      {
        path: 'dispatch',
        loadComponent: () =>
          import('./features/admin/dispatch/dispatch').then((m) => m.DispatchComponent),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/admin/incident-map/incident-map').then((m) => m.IncidentMapComponent),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/reports/reports').then((m) => m.ReportsComponent),
      },
      {
        path: 'nlp-review',
        loadComponent: () =>
          import('./features/admin/nlp-review/nlp-review').then((m) => m.NlpReviewComponent),
      },
      {
        path: 'priority-prediction',
        loadComponent: () =>
          import('./features/admin/priority-prediction/priority-prediction').then(
            (m) => m.PriorityPredictionComponent,
          ),
      },
      {
        path: 'temporal-trends',
        loadComponent: () =>
          import('./features/admin/temporal-trends/temporal-trends').then(
            (m) => m.TemporalTrendsComponent,
          ),
      },
      {
        path: 'spatial-hotspots',
        loadComponent: () =>
          import('./features/admin/spatial-hotspots/spatial-hotspots').then(
            (m) => m.SpatialHotspotsComponent,
          ),
      },
      {
        path: 'restoration-estimation',
        loadComponent: () =>
          import('./features/admin/restoration-estimation/restoration-estimation').then(
            (m) => m.RestorationEstimationComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/reports/reports').then((m) => m.ReportsComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management').then(
            (m) => m.UserManagementComponent,
          ),
      },
      {
        path: 'model-monitoring',
        loadComponent: () =>
          import('./features/admin/model-monitoring/model-monitoring').then(
            (m) => m.ModelMonitoringComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/settings').then((m) => m.AdminSettingsComponent),
      },
      {
        path: 'audit-trail',
        loadComponent: () =>
          import('./features/admin/audit-trail/audit-trail').then((m) => m.AuditTrailComponent),
      },
    ],
  },
  {
    path: 'member',
    canActivate: [authGuard],
    data: { role: 'member' },
    loadComponent: () =>
      import('./layouts/member-layout/member-layout').then((m) => m.MemberLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/member/home/member-home').then((m) => m.MemberHomeComponent),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/member/submit-concern/submit-concern').then(
            (m) => m.SubmitConcernComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/member/my-reports/my-reports').then((m) => m.MemberReportsComponent),
      },
      {
        path: 'reports/:id',
        loadComponent: () =>
          import('./features/member/my-reports/complaint-tracking').then(
            (m) => m.ComplaintTrackingComponent,
          ),
      },
      {
        path: 'updates',
        loadComponent: () =>
          import('./features/member/updates/member-updates').then((m) => m.MemberUpdatesComponent),
      },
      {
        path: 'updates/:id',
        loadComponent: () =>
          import('./features/member/announcement-detail/announcement-detail').then(
            (m) => m.AnnouncementDetailComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/member/profile/member-profile').then((m) => m.MemberProfileComponent),
      },
    ],
  },
  {
    path: 'field-worker',
    canActivate: [authGuard],
    data: { role: 'field-worker' },
    loadComponent: () =>
      import('./layouts/field-worker-layout/field-worker-layout').then(
        (m) => m.FieldWorkerLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/field-worker/home/field-home').then((m) => m.FieldHomeComponent),
      },
      {
        path: 'assignments',
        loadComponent: () =>
          import('./features/field-worker/assignments/assignments').then(
            (m) => m.AssignmentsComponent,
          ),
      },
      {
        path: 'assignments/:id',
        loadComponent: () =>
          import('./features/field-worker/assignments/assignment-detail').then(
            (m) => m.AssignmentDetailComponent,
          ),
      },
      {
        path: 'map',
        loadComponent: () =>
          import('./features/field-worker/map/field-map').then((m) => m.FieldMapComponent),
      },
      {
        path: 'updates',
        loadComponent: () =>
          import('./features/field-worker/updates/updates').then((m) => m.FieldUpdatesComponent),
        data: { page: 'Updates' },
      },
      {
        path: 'work-orders',
        loadComponent: () =>
          import('./features/field-worker/assignments/assignments').then(
            (m) => m.AssignmentsComponent,
          ),
        data: { page: 'Work orders' },
      },
      {
        path: 'repair-progress',
        loadComponent: () =>
          import('./features/field-worker/assignments/assignments').then(
            (m) => m.AssignmentsComponent,
          ),
        data: { page: 'Repair progress' },
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/field-worker/work-history/work-history').then(
            (m) => m.WorkHistoryComponent,
          ),
        data: { page: 'Work history' },
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/field-worker/profile/field-profile').then(
            (m) => m.FieldProfileComponent,
          ),
        data: { page: 'Profile' },
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
