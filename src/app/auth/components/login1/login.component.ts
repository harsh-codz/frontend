import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false,
  styleUrls: ['./login.component.scss'] // or .css
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage: string | null = null;
  isLoading = false;

  // Inject AuthService and Router (add AuthService later)
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Optional: Check if user is already logged in, redirect if necessary
    // This logic will be more robust once state management is in place
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.username, this.password).subscribe({
      next: (userInfo) => {
        this.isLoading = false;
        console.log('Login successful:', userInfo);
        // TODO: Store user info using state management
        // TODO: Handle passwordResetRequired flag if needed

        // Navigate to the main dashboard or appropriate page
        this.router.navigate(['/dashboard']); // Assuming '/dashboard' is your target route after login
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Login failed:', error);
        if (error.status === 401) {
          // Use the error message from the backend if available, otherwise generic
          this.errorMessage = error.error?.message || 'Invalid username or password.';
        } else {
          // Handle other potential errors (network, server down, etc.)
          this.errorMessage = 'An error occurred during login. Please try again later.';
        }
      }
    });
  }
}