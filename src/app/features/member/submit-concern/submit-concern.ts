import { BARANGAYS } from '../../../data/mock/geography';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Component, inject, signal, OnDestroy } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConcernRepository } from '../../../data/repositories/concern.repository';
import { AuthPort } from '../../../models/auth';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header';
@Component({
  selector: 'app-submit-concern',
  standalone: true,
  imports: [RouterLink, IconComponent, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './submit-concern.html',
  styleUrl: './submit-concern.scss',
})
export class SubmitConcernComponent implements OnDestroy {
  ngOnDestroy(): void {
    if (!this.submitted()) this.photos().forEach((url) => URL.revokeObjectURL(url));
  }
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(ConcernRepository);
  private readonly auth = inject(AuthPort);

  readonly previous = (step: number) => step - 1;
  readonly places = BARANGAYS;
  readonly municipalities = [...new Set(BARANGAYS.map((x) => x.municipality))];
  readonly step = signal(1);
  readonly gps = signal('');
  readonly feedback = signal('');
  readonly reference = signal('');
  get barangays() {
    return this.places.filter((x) => x.municipality === this.form.controls.location.value);
  }
  next(): void {
    this.form.markAllAsTouched();
    if (this.step() === 1) {
      if (this.form.controls.description.invalid || this.form.controls.category.invalid) return;
    } else if (this.form.invalid) return;
    this.step.update((x) => Math.min(3, x + 1));
  }
  readonly photos = signal<string[]>([]);
  readonly submitted = signal(false);
  readonly saving = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    category: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(12)]],
    language: ['Filipino', Validators.required],
    households: [1, [Validators.required, Validators.min(1)]],
    location: ['', Validators.required],
    barangay: ['', Validators.required],
  });
  useLocation(): void {
    if (!navigator.geolocation) {
      this.gps.set(
        'GPS unavailable. Your selected municipality and barangay will still be submitted.',
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        this.gps.set(
          `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        ),
      () =>
        this.gps.set(
          'GPS unavailable. Your selected municipality and barangay will still be submitted.',
        ),
    );
  }
  private coordinates(text: string): { coordinates?: [number, number] } {
    const match = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (!match) return {};
    const lat = Number(match[1]),
      lon = Number(match[2]);
    return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { coordinates: [lon, lat] } : {};
  }
  attach(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []).slice(0, 3);
    if (files.some((file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)) {
      this.feedback.set('Choose images smaller than 5 MB each.');
      return;
    }
    this.photos().forEach((url) => URL.revokeObjectURL(url));
    this.photos.set(files.map((file) => URL.createObjectURL(file)));
    this.feedback.set('');
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.step() !== 3 || this.submitted() || this.saving()) return;
    const value = this.form.getRawValue();
    const place = this.places.find(
      (x) => x.municipality === value.location && x.barangay === value.barangay,
    );
    if (!place) {
      this.feedback.set('Choose a barangay belonging to the selected municipality.');
      return;
    }
    const name = this.auth.session()?.name ?? 'Demo member';
    const reference = 'OC-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    this.reference.set(reference);
    this.saving.set(true);
    this.repository
      .create({
        id: reference,
        member: name,
        category: value.category,
        priority: 'Routine',
        status: 'Received · awaiting review',
        location: value.location + ', ' + value.barangay,
        municipality: value.location,
        barangay: value.barangay,
        barangayCode: place.code,
        ...this.coordinates(this.gps()),
        time: new Date().toLocaleString(),
        households: value.households,
        description: value.description,
        language: value.language,
        assignedCrew: '',
        channel: 'Member app',
        photos: this.photos(),
      })
      .subscribe({
        next: (saved) => {
          this.reference.set(saved.id);
          this.submitted.set(true);
          this.saving.set(false);
          this.feedback.set('Report received. Reference: ' + saved.id);
        },
        error: () => {
          this.saving.set(false);
          this.feedback.set('Your report could not be saved. Please retry.');
        },
      });
  }
}
