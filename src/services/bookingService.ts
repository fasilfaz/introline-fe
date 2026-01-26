import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Define the Booking interface to match the backend model
export interface Booking {
  _id?: string;
  sender: {
    _id: string;
    name: string;
    customerType: 'Sender';
  };
  receiver: {
    _id: string;
    name: string;
    customerType: 'Receiver';
    branches?: Array<{
      branchName: string;
      location?: string;
      phone?: string;
      contactPerson?: string;
    }>;
  };
  receiverBranch?: string;
  pickupPartner: {
    _id: string;
    name: string;
    phoneNumber: string;
    price?: number;
  };
  date: string;
  expectedReceivingDate: string;
  bundleCount: number;
  status: 'pending' | 'success';
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing bookings
export interface ListBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sender?: string;
  receiver?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a booking
export interface CreateBookingPayload {
  sender: string;
  receiver: string;
  receiverBranch?: string;
  pickupPartner: string;
  date: string;
  expectedReceivingDate: string;
  bundleCount: number;
  status?: 'pending' | 'success';
}

export interface UpdateBookingPayload extends Partial<CreateBookingPayload> {}

// Booking service with all CRUD operations
export const bookingService = {
  // Fetch all bookings with pagination and filters
  async listBookings(params: ListBookingsParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sender) queryParams.append('sender', params.sender);
    if (params.receiver) queryParams.append('receiver', params.receiver);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<Booking>>(`/bookings${queryString}`);
  },

  // Alias for listBookings to maintain compatibility
  async list(params: ListBookingsParams = {}) {
    return this.listBookings(params);
  },

  // Fetch a single booking by ID
  async getBooking(id: string) {
    return apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
  },

  // Create a new booking
  async createBooking(booking: CreateBookingPayload) {
    return apiClient.post<ApiResponse<Booking>>('/bookings', booking);
  },

  // Update an existing booking
  async updateBooking(id: string, booking: UpdateBookingPayload) {
    return apiClient.put<ApiResponse<Booking>>(`/bookings/${id}`, booking);
  },

  // Delete a booking
  async deleteBooking(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/bookings/${id}`);
  }
};