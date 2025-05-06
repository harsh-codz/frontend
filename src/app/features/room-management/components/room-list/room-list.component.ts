import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { RoomFormDialogComponent } from '../room-form-dialog/room-form-dialog.component'; // We'll create this next
import { Subject } from 'rxjs';
import { takeUntil, catchError, switchMap, startWith, map } from 'rxjs/operators';
import { merge } from 'rxjs';


@Component({
  selector: 'app-room-list',
  standalone: false,
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit, AfterViewInit, OnDestroy {

  displayedColumns: string[] = ['roomNumber', 'roomType', 'pricePerNight', 'status', 'maxOccupancy', 'actions'];
  dataSource = new MatTableDataSource<Room>([]);
  totalElements = 0;
  isLoading = false;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // TODO: Add filter properties (e.g., filterValue: string = '')

  constructor(
    private roomService: RoomService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // Reset paginator to first page if sorting changes
     this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // Combine sort and page changes into a single stream
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}), // Trigger initial load
        switchMap(() => {
          this.isLoading = true;
          const sortActive = this.sort.active || 'roomNumber';
          const sortDirection = this.sort.direction || 'asc';
          const sortParam = `${sortActive},${sortDirection}`;
          // TODO: Get filter values
          const filters = { /* Add filters here */ };

          return this.roomService.getRooms(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            sortParam,
            filters
          ).pipe(catchError(() => {
              this.isLoading = false;
              this.snackBar.open('Error loading rooms.', 'Close', { duration: 3000 });
              return []; // Return empty array on error
          }));
        }),
        map(data => {
             this.isLoading = false;
             this.totalElements = data.totalElements;
             return data.content;
        }),
        takeUntil(this.destroy$) // Unsubscribe when component destroyed
      )
      .subscribe(rooms => {
         this.dataSource.data = rooms;
      });
  }

  ngOnDestroy(): void {
     this.destroy$.next();
     this.destroy$.complete();
  }

  applyFilter(event: Event): void {
    // TODO: Implement filtering logic
    // const filterValue = (event.target as HTMLInputElement).value;
    // Trigger data reload via merge(...) stream or separate method call
  }

  openAddRoomDialog(): void {
    this.openRoomDialog();
  }

  openEditRoomDialog(room: Room): void {
    this.openRoomDialog(room);
  }

  openRoomDialog(roomData?: Room): void {
    const dialogRef = this.dialog.open(RoomFormDialogComponent, {
      width: '600px', // Adjust width as needed
      data: { room: roomData } // Pass room data for editing, null/undefined for adding
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
         this.snackBar.open(`Room ${roomData ? 'updated' : 'created'} successfully!`, 'Close', { duration: 3000 });
        // Trigger data refresh - easiest way is to re-trigger the merge stream
         this.paginator.page.emit(); // Simulate a page event to reload
      } else if (result && result.error) {
          this.snackBar.open(`Error: ${result.error}`, 'Close', { duration: 5000 });
      }
    });
  }


  deleteRoom(room: Room): void {
    // TODO: Add confirmation dialog before deleting
    if (confirm(`Are you sure you want to delete Room ${room.roomNumber}?`)) { // Replace with MatDialog later
        this.isLoading = true; // Optional: show loading state
        this.roomService.deleteRoom(room.id).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.isLoading = false;
                this.snackBar.open(`Room ${room.roomNumber} deleted successfully!`, 'Close', { duration: 3000 });
                // Trigger data refresh
                this.paginator.page.emit();
            },
            error: (err) => {
                this.isLoading = false;
                const message = err.error?.message || err.message || 'Failed to delete room.';
                // Check for 409 Conflict specifically
                const detailedMessage = err.status === 409 ? `${message} (Maybe related bookings?)` : message;
                this.snackBar.open(`Error: ${detailedMessage}`, 'Close', { duration: 5000 });
                console.error("Delete error:", err);
            }
        });
    }
  }
}