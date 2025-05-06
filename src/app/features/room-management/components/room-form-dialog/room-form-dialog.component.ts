import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '../../services/room.service';
import { Room, RoomRequest } from '../../models/room.model';
import { RoomType } from '../../models/room-type.model';
import { Amenity } from '../../models/amenity.model';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
const OCCUPIED_STATUS = 'OCCUPIED';
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
  availableStatuses: string[] = ['AVAILABLE', 'MAINTENANCE', 'CLEANING', OCCUPIED_STATUS, 'OUT_OF_ORDER']; // NEED ACTUAL STATUSES FROM BACKEND
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
    if (this.isEditMode && this.roomData.roomStatus === OCCUPIED_STATUS) {
      this.snackBar.open(`Cannot update room details while it is ${OCCUPIED_STATUS}.`, 'Close', { duration: 4000 });
      return; // Stop execution, do not call API
    }
    this.isSaving = true;

    const apiCall = this.isEditMode && this.originalRoomId
    ? this.roomService.updateRoom(this.originalRoomId, this.roomData)
    : this.roomService.createRoom(this.roomData);

  apiCall.pipe(takeUntil(this.destroy$)).subscribe({
    next: (savedRoom) => {
      this.isSaving = false;
      // Pass back event type and room number for specific message
      this.dialogRef.close({ event: 'saved', roomNumber: savedRoom.roomNumber });
    },
    error: (err: HttpErrorResponse) => { // Add type HttpErrorResponse
      this.isSaving = false;
      let detailedMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} room.`; // Default message
      const backendErrorMessage = err.error?.message || err.message; // Try to get message from backend response

      // --- Specific handling for 409 Conflict ---
      if (err.status === 409) {
         if (this.isEditMode) {
             detailedMessage = `Error: Cannot update room. ${backendErrorMessage || 'May conflict with existing bookings.'}`;
         } else { // Create mode conflict is likely duplicate room number
             detailedMessage = `Error: Cannot create room. ${backendErrorMessage || 'Room number might already exist.'}`;
         }
      } else if (backendErrorMessage) {
          // Use backend message for other errors if available
          detailedMessage = `Error: ${backendErrorMessage}`;
      }
      // --- End of specific handling ---

      console.error("Save error:", err);
      this.snackBar.open(detailedMessage, 'Close', { duration: 6000 }); // Show 
           // Keep dialog open on error
       }
    });
  }
}