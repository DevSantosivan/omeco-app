import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthPort } from '../../models/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthPort);
  const router = inject(Router);
  const session = auth.session();
  if (!session) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  const requiredRole = route.data['role'] as string | undefined;
  return !requiredRole || session.role === requiredRole ? true : router.parseUrl('/access-denied');
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthPort);
  const router = inject(Router);
  return auth.session() ? router.parseUrl(auth.landingPath(auth.session()!.role)) : true;
};
