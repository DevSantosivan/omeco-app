import { DemoAuthService } from './demo-auth.service';

describe('DemoAuthService', () => {
  beforeEach(() => sessionStorage.clear());

  it('creates a role-specific session for a demo account', () => {
    const auth = new DemoAuthService();
    const session = auth.signIn('ADMIN@OMECO.DEMO');
    expect(session?.role).toBe('admin');
    expect(auth.session()?.email).toBe('admin@omeco.demo');
  });

  it('rejects unknown accounts and clears a session on sign out', () => {
    const auth = new DemoAuthService();
    expect(auth.signIn('unknown@example.com')).toBeNull();
    auth.signIn('staff@omeco.demo');
    auth.signOut();
    expect(auth.session()).toBeNull();
  });
});
