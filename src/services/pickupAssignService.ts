import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Define the LR Number interface
export interface LRNumber {
  lrNumber: string;
  status: 'Collected' | 'Not Collected';
}

// Define the PickupAssign interface
export interface PickupAssign {
  _id?: string;
  transportPartnerId: string;
  transportPartner?: {
    _id: string;
    name: string;
    phoneNumber: string;
    price?: number;
  };
  lrNumbers: LRNumber[];
  assignDate: string;
  status: 'Pending' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing pickup assignments
export interface ListPickupAssignsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  transportPartnerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a pickup assignment
export interface CreatePickupAssignPayload {
  transportPartnerId: string;
  lrNumbers: LRNumber[];
  assignDate: string;
  status?: 'Pending' | 'Completed';
}

export interface UpdatePickupAssignPayload extends Partial<CreatePickupAssignPayload> {}

// Define the payload for updating LR status
export interface UpdateLRStatusPayload {
  lrNumber: string;
  status: 'Collected' | 'Not Collected';
}

// Pickup assign service with all CRUD operations
export const pickupAssignService = {
  // Fetch all pickup assignments with pagination and filters
  async listPickupAssigns(params: ListPickupAssignsParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.transportPartnerId) queryParams.append('transportPartnerId', params.transportPartnerId);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<PickupAssign>>(`/pickup-assigns${queryString}`);
  },

  // Fetch a single pickup assignment by ID
  async getPickupAssign(id: string) {
    return apiClient.get<ApiResponse<PickupAssign>>(`/pickup-assigns/${id}`);
  },

  // Create a new pickup assignment
  async createPickupAssign(pickupAssign: CreatePickupAssignPayload) {
    return apiClient.post<ApiResponse<PickupAssign>>('/pickup-assigns', pickupAssign);
  },

  // Update an existing pickup assignment
  async updatePickupAssign(id: string, pickupAssign: UpdatePickupAssignPayload) {
    return apiClient.put<ApiResponse<PickupAssign>>(`/pickup-assigns/${id}`, pickupAssign);
  },

  // Delete a pickup assignment
  async deletePickupAssign(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/pickup-assigns/${id}`);
  },

  // Update LR number status
  async updateLRStatus(id: string, payload: UpdateLRStatusPayload) {
    return apiClient.patch<ApiResponse<PickupAssign>>(`/pickup-assigns/${id}/lr-status`, payload);
  }
};