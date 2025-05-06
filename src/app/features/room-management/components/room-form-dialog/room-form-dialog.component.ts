import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '../../services/room.service';
import { Room, RoomRequest } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { Amenity } from '../../models/amenity.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-room-form-dialog',
  standalone: false,
  templateUrl: './room-form-dialog.component.html',
  styleUrls: ['./room-form-dialog.component.scss']
})
export class RoomFormDialogComponent implements OnInit, OnDestroy {
  roomData: RoomRequest = { // Initialize with defaults for creation
      roomNumber: '',
      roomTypeId: 0,
      pricePerNight: 0,
      roomStatus: '', // NEED DEFAULT STATUS
      maxOccupancy: 1,
      amenityIds: []
  };
  isEditMode = false;
  isLoading = true; // Loading types/amenities
  isSaving = false;
  roomTypes: RoomType[] = [];
  amenities: Amenity[] = [];
  availableStatuses: string[] = ['AVAILABLE', 'MAINTENANCE', 'CLEANING']; // NEED ACTUAL STATUSES FROM BACKEND
  originalRoomId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<RoomFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { room?: Room }, // Inject data passed from list component
    private roomService: RoomService,
    private snackBar: MatSnackBar
  ) {
    if (data && data.room) {
      this.isEditMode = true;
      this.originalRoomId = data.room.id;
      // Map Room response data to RoomRequest structure for the form
      this.roomData = {
         roomNumber: data.room.roomNumber,
         roomTypeId: data.room.roomType.id,
         pricePerNight: data.room.pricePerNight,
         roomStatus: data.room.roomStatus,
         maxOccupancy: data.room.maxOccupancy,
         description: data.room.description,
         amenityIds: data.room.amenities.map(a => a.id) // Extract IDs
      };
    }
  }

  ngOnInit(): void {
    this.loadDropdownData();
  }

  ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
  }


  loadDropdownData(): void {
      this.isLoading = true;
      forkJoin({ // Load types and amenities in parallel
          types: this.roomService.getRoomTypes(),
          amenities: this.roomService.getAmenities()
      }).pipe(
          takeUntil(this.destroy$),
          catchError(err => {
              this.isLoading = false;
              this.snackBar.open('Error loading necessary data (types/amenities).', 'Close', { duration: 3000 });
              console.error("Error loading dropdown data:", err);
              this.dialogRef.close({ error: 'Failed to load required data.' }); // Close dialog if data fails
              return [];
          })
      ).subscribe(({ types, amenities }) => {
          this.roomTypes = types;
          this.amenities = amenities;
          this.isLoading = false;

          // Set default room type if not editing and types are available
          if (!this.isEditMode && this.roomTypes.length > 0 && !this.roomData.roomTypeId) {
             this.roomData.roomTypeId = this.roomTypes[0].id;
          }
          // Set default status if not editing
           if (!this.isEditMode && this.availableStatuses.length > 0 && !this.roomData.roomStatus) {
              this.roomData.roomStatus = this.availableStatuses[0];
           }
      });
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without sending data
  }

  onSave(): void {
    if (this.isSaving) return; // Prevent double-click
    this.isSaving = true;

    const apiCall = this.isEditMode && this.originalRoomId
      ? this.roomService.updateRoom(this.originalRoomId, this.roomData)
      : this.roomService.createRoom(this.roomData);

    apiCall.pipe(takeUntil(this.destroy$)).subscribe({
       next: (savedRoom) => {
           this.isSaving = false;
           this.dialogRef.close('saved'); // Signal success
       },
       error: (err) => {
           this.isSaving = false;
           const message = err.error?.message || err.message || `Failed to ${this.isEditMode ? 'update' : 'create'} room.`;
           // Check for 409 Conflict (e.g., duplicate room number)
            const detailedMessage = err.status === 409 ? `${message} (Possible conflict?)` : message;
           console.error("Save error:", err);
           this.snackBar.open(`Error: ${detailedMessage}`, 'Close', { duration: 5000 });
           // Keep dialog open on error
       }
    });
  }
}