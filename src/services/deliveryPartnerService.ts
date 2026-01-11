import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Define the DeliveryPartner interface
export interface DeliveryPartner {
  _id?: string;
  name: string;
  phoneNumber: string;
  price: number; // delivery charge
  country: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing delivery partners
export interface ListDeliveryPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a delivery partner
export interface CreateDeliveryPartnerPayload {
  name: string;
  phoneNumber: string;
  price: number;
  country: string;
  status: 'Active' | 'Inactive';
}

export interface UpdateDeliveryPartnerPayload extends Partial<CreateDeliveryPartnerPayload> {
  isActive?: boolean;
}

// Delivery partner service with all CRUD operations
export const deliveryPartnerService = {
  // Fetch all delivery partners with pagination and filters
  async listDeliveryPartners(params: ListDeliveryPartnersParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.country) queryParams.append('country', params.country);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<DeliveryPartner>>(`/delivery-partners${queryString}`);
  },

  // Fetch a single delivery partner by ID
  async getDeliveryPartner(id: string) {
    return apiClient.get<ApiResponse<DeliveryPartner>>(`/delivery-partners/${id}`);
  },

  // Create a new delivery partner
  async createDeliveryPartner(deliveryPartner: CreateDeliveryPartnerPayload) {
    return apiClient.post<ApiResponse<DeliveryPartner>>('/delivery-partners', deliveryPartner);
  },

  // Update an existing delivery partner
  async updateDeliveryPartner(id: string, deliveryPartner: UpdateDeliveryPartnerPayload) {
    return apiClient.put<ApiResponse<DeliveryPartner>>(`/delivery-partners/${id}`, deliveryPartner);
  },

  // Delete a delivery partner
  async deleteDeliveryPartner(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/delivery-partners/${id}`);
  }
};