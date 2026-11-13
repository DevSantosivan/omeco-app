import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { apiPrefixInterceptor } from './interceptors/api-prefix.interceptor';
import { AuthPort } from './models/auth';
import { DemoAuthService } from './core/auth/demo-auth.service';
import { ConcernRepository } from './data/repositories/concern.repository';
import { MockConcernRepository } from './data/repositories/mock-concern.repository';
import { HttpConcernRepository } from './data/repositories/http-concern.repository';
import {
  WorkspaceRepository,
  MockWorkspaceRepository,
  HttpWorkspaceRepository,
} from './data/repositories/workspace.repository';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([apiPrefixInterceptor])),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    { provide: AuthPort, useClass: DemoAuthService },
    {
      provide: ConcernRepository,
      useClass: environment.useMockServices ? MockConcernRepository : HttpConcernRepository,
    },
    {
      provide: WorkspaceRepository,
      useClass: environment.useMockServices ? MockWorkspaceRepository : HttpWorkspaceRepository,
    },
  ],
};
