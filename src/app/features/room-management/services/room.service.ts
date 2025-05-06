import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Room, RoomRequest } from '../models/room.model';
import { RoomType } from '../models/room-type.model';
import { Amenity } from '../models/amenity.model';

@Injectable({
  providedIn: 'root' // Or provide in RoomManagementModule if preferred
})
export class RoomService {
  private apiUrl = '/api/admin/rooms'; // Base URL for room management API

  constructor(private http: HttpClient) { }

  // GET /api/admin/rooms - List/Search Rooms with Pagination/Sorting/Filtering
  getRooms(
    page: number,
    size: number,
    sort: string, // e.g., 'roomNumber,asc'
    filters?: any // Define a specific filter interface later if needed
  ): Observable<Page<Room>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    // Add filter parameters dynamically
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }

    // Interceptor adds withCredentials: true
    return this.http.get<Page<Room>>(this.apiUrl, { params });
  }

  // GET /api/admin/rooms/{id} - Get Room by ID
  getRoomById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  // POST /api/admin/rooms - Create New Room
  createRoom(roomRequest: RoomRequest): Observable<Room> {
    return this.http.post<Room>(this.apiUrl, roomRequest);
  }

  // PUT /api/admin/rooms/{id} - Update Room
  updateRoom(id: number, roomRequest: RoomRequest): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, roomRequest);
  }

  // DELETE /api/admin/rooms/{id} - Delete Room
  deleteRoom(id: number): Observable<void> { // Expects 204 No Content
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET /api/admin/rooms/types - Get all Room Types
  getRoomTypes(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(`${this.apiUrl}/types`);
  }

  // GET /api/admin/rooms/amenities - Get all Amenities
  getAmenities(): Observable<Amenity[]> {
    return this.http.get<Amenity[]>(`${this.apiUrl}/amenities`);
  }

  // TODO: Implement Bulk Upload method later if needed
}