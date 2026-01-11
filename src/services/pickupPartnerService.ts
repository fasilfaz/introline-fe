import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Define the PickupPartner interface
export interface PickupPartner {
  _id?: string;
  name: string;
  phoneNumber: string;
  price: number; // pickup charge
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing pickup partners
export interface ListPickupPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a pickup partner
export interface CreatePickupPartnerPayload {
  name: string;
  phoneNumber: string;
  price: number;
  status: 'Active' | 'Inactive';
}

export interface UpdatePickupPartnerPayload extends Partial<CreatePickupPartnerPayload> {
  isActive?: boolean;
}

// Pickup partner service with all CRUD operations
export const pickupPartnerService = {
  // Fetch all pickup partners with pagination and filters
  async listPickupPartners(params: ListPickupPartnersParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<PickupPartner>>(`/pickup-partners${queryString}`);
  },

  // Fetch a single pickup partner by ID
  async getPickupPartner(id: string) {
    return apiClient.get<ApiResponse<PickupPartner>>(`/pickup-partners/${id}`);
  },

  // Create a new pickup partner
  async createPickupPartner(pickupPartner: CreatePickupPartnerPayload) {
    return apiClient.post<ApiResponse<PickupPartner>>('/pickup-partners', pickupPartner);
  },

  // Update an existing pickup partner
  async updatePickupPartner(id: string, pickupPartner: UpdatePickupPartnerPayload) {
    return apiClient.put<ApiResponse<PickupPartner>>(`/pickup-partners/${id}`, pickupPartner);
  },

  // Delete a pickup partner
  async deletePickupPartner(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/pickup-partners/${id}`);
  }
};