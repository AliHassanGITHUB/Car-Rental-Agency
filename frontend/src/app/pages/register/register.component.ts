import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>Create Account</h1>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        @if (validationErrors().length > 0) {
          <div class="validation-errors">
            @for (error of validationErrors(); track error) {
              <p>{{ error }}</p>
            }
          </div>
        }

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="Enter your full name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="Enter your email"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              [(ngModel)]="phone"
              name="phone"
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="Enter your password"
            />
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirm Password</label>
            <input
              id="password_confirmation"
              type="password"
              [(ngModel)]="passwordConfirmation"
              name="password_confirmation"
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" [disabled]="isLoading()">
            {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <p class="switch-auth">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .register-card {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 450px;
    }

    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .error-message {
      background-color: #fee;
      border: 1px solid #fcc;
      color: #c00;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .validation-errors {
      background-color: #fff8e1;
      border: 1px solid #ffe082;
      color: #e65100;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .validation-errors p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    button:hover:not(:disabled) {
      background-color: #218838;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .switch-auth {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .switch-auth a {
      color: #007bff;
      text-decoration: none;
    }

    .switch-auth a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  passwordConfirmation = '';

  isLoading = signal(false);
  errorMessage = signal('');
  validationErrors = signal<string[]>([]);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.validationErrors.set([]);
    this.isLoading.set(true);

    this.authService.register({
      name: this.name,
      email: this.email,
      phone: this.phone,
      password: this.password,
      password_confirmation: this.passwordConfirmation
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.errors) {
          const errors: string[] = [];
          for (const field in err.error.errors) {
            errors.push(...err.error.errors[field]);
          }
          this.validationErrors.set(errors);
        } else {
          this.errorMessage.set(err.error?.message || 'Registration failed');
        }
      }
    });
  }
}
