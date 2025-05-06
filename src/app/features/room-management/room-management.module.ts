import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Or ReactiveFormsModule

import { RoomManagementRoutingModule } from './room-management-routing.module';
import { MaterialModule } from '../../shared/material.module';
import { RoomListComponent } from './components/room-list/room-list.component';
import { RoomFormDialogComponent } from './components/room-form-dialog/room-form-dialog.component'; // Import shared Material module

// Import components when generated
// import { RoomListComponent } from './components/room-list/room-list.component';
// import { RoomFormDialogComponent } from './components/room-form-dialog/room-form-dialog.component';


@NgModule({
  declarations: [
    // Components will be added here automatically by ng generate
    // RoomListComponent,
    // RoomFormDialogComponent
  
    RoomListComponent,
    RoomFormDialogComponent
  ],
  imports: [
    CommonModule,
    RoomManagementRoutingModule,
    MaterialModule, // Make Material components available
    FormsModule     // Or ReactiveFormsModule
  ]
})
export class RoomManagementModule { }