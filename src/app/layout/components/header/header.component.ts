import { Component } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service'; // Adjust path if needed

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'] // or .css
})
export class HeaderComponent {

  constructor(public authService: AuthService) { } // Inject AuthService

  logout(): void {
    this.authService.logout().subscribe({
      next: () => console.log('Header: Logout initiated.'),
      error: (err) => console.error('Header: Logout failed', err)
    });
  }
}