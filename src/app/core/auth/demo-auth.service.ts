import { Injectable, signal } from '@angular/core';
import { AuthPort, AuthSession, DemoAccount, UserRole } from '../../models/auth';

@Injectable()
export class DemoAuthService implements AuthPort {
  readonly demoAccounts: DemoAccount[] = [
    { email: 'admin@omeco.demo', name: 'Maria Reyes', role: 'admin', label: 'Dispatcher' },
    { email: 'member@omeco.demo', name: 'Ana Mendoza', role: 'member', label: 'Member' },
    { email: 'staff@omeco.demo', name: 'Jose Lim', role: 'field-worker', label: 'Field worker' },
  ];
  private readonly current = signal<AuthSession | null>(this.restoreSession());
  readonly session = this.current.asReadonly();

  signIn(email: string): AuthSession | null {
    const account = this.demoAccounts.find((item) => item.email === email.trim().toLowerCase());
    if (!account) return null;
    const session: AuthSession = { email: account.email, name: account.name, role: account.role };
    this.current.set(session);
    try {
      sessionStorage.setItem('omeco-demo-session', JSON.stringify(session));
    } catch {
      /* Browser storage can be disabled. */
    }
    return session;
  }

  signOut(): void {
    this.current.set(null);
    try {
      sessionStorage.removeItem('omeco-demo-session');
    } catch {
      /* Continue with in-memory sign-out. */
    }
  }

  landingPath(role: UserRole): string {
    return role === 'admin'
      ? '/admin/dashboard'
      : role === 'member'
        ? '/member/home'
        : '/field-worker/home';
  }

  private restoreSession(): AuthSession | null {
    try {
      const value = sessionStorage.getItem('omeco-demo-session');
      if (!value) return null;
      const parsed = JSON.parse(value) as AuthSession;
      return this.demoAccounts.some(
        (account) => account.email === parsed.email && account.role === parsed.role,
      )
        ? parsed
        : null;
    } catch {
      return null;
    }
  }
}
