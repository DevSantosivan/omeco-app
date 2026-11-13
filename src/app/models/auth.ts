import { Signal } from '@angular/core';

export type UserRole = 'admin' | 'member' | 'field-worker';
export interface DemoAccount {
  email: string;
  name: string;
  role: UserRole;
  label: string;
}
export interface AuthSession {
  email: string;
  name: string;
  role: UserRole;
}
export abstract class AuthPort {
  abstract readonly session: Signal<AuthSession | null>;
  abstract signIn(email: string): AuthSession | null;
  abstract signOut(): void;
  abstract landingPath(role: UserRole): string;
}
