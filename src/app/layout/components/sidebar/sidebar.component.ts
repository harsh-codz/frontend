import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service'; // Adjust path
import { UserInfoResponse } from '../../../auth/models/user-info.model'; // Adjust path

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  standalone: false,
  styleUrls: ['./sidebar.component.scss'] // or .css
})
export class SidebarComponent implements OnInit, OnDestroy {
  private userSubscription: Subscription | undefined;
  currentUserRoles: string[] = [];

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUserRoles = user?.roles || [];
       console.log("Sidebar: User roles updated", this.currentUserRoles);
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  // Helper function to check roles for *ngIf
  hasRole(roleOrRoles: string | string[]): boolean {
    if (!this.currentUserRoles || this.currentUserRoles.length === 0) {
      return false;
    }

    if (typeof roleOrRoles === 'string') {
      return this.currentUserRoles.includes(roleOrRoles);
    } else {
      // Check if user has AT LEAST ONE of the required roles
      return roleOrRoles.some(role => this.currentUserRoles.includes(role));
    }
  }
}