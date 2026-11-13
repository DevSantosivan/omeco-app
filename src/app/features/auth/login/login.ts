import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthPort } from '../../../models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IconComponent, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly auth = inject(AuthPort);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  error = '';

  choose(email: string): void {
    this.form.controls.email.setValue(email);
    this.error = '';
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const session = this.auth.signIn(this.form.controls.email.value);
    if (!session) {
      this.error = 'Choose one of the demo accounts below.';
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const destination =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : this.auth.landingPath(session.role);
    void this.router.navigateByUrl(destination);
  }
}
