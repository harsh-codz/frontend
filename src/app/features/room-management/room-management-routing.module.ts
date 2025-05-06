import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoomListComponent } from './components/room-list/room-list.component';

const routes: Routes = [
  {
    path: '', // Default route for this module (e.g., /admin/rooms)
    component: RoomListComponent
  }
  // Add routes for details page if needed later: { path: ':id', component: RoomDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomManagementRoutingModule { }