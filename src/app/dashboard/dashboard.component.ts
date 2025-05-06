import { Component, OnInit } from '@angular/core';
// No longer need AuthService here unless you need user data specifically for dashboard logic

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

 
  constructor() { }

  ngOnInit(): void {
  }

}