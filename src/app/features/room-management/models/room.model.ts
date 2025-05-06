
import { Amenity } from './amenity.model';
import { RoomType } from './room-type.model';


// Based on RoomResponse from backend summary
export interface Room { // Using 'Room' for simplicity, maps to RoomResponse
  id: number;
  roomNumber: string;
  pricePerNight: number;
  roomStatus: string; // e.g., 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE' - NEED EXACT ENUMS
  maxOccupancy: number;
  description?: string;
  roomType: RoomType; // Assuming RoomType object is nested
  amenities: Amenity[]; // Assuming Amenity objects are nested
  // Add any other fields returned by the backend
}

// Based on RoomRequest from backend summary
export interface RoomRequest {
  roomNumber: string;
  roomTypeId: number; // Send ID for type
  pricePerNight: number;
  roomStatus: string; // NEED EXACT ENUMS
  maxOccupancy: number;
  description?: string;
  amenityIds?: number[]; // Send IDs for amenities
}

// Interface for Spring Page object (can be moved to a shared models folder later)
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number; // Current page number (0-indexed)
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number; // Elements on the current page
  first: boolean;
  empty: boolean;
}

// Based on RoomTypeResponse
