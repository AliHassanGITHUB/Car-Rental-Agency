import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    this.error.set(null);
    const payload = this.form.getRawValue();
    const request = this.mode() === 'login'
      ? this.auth.login({ email: payload.email, password: payload.password })
      : this.auth.register(payload);

    request.subscribe({
      next: (response) => this.router.navigateByUrl(response.user.role === 'admin' ? '/admin' : '/dashboard'),
      error: () => this.error.set('The account details could not be verified. Please try again.')
    });
  }
}
