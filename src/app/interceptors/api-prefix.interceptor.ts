import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const apiPrefixInterceptor: HttpInterceptorFn = (request, next) => {
  const url = request.url.startsWith('/api')
    ? `${environment.apiBaseUrl}${request.url}`
    : request.url;
  return next(url === request.url ? request : request.clone({ url }));
};
