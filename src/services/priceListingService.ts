import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';
import type { DeliveryPartner } from './deliveryPartnerService';

// Define the PriceListing interface
export interface PriceListing {
  _id?: string;
  fromCountry: string;
  toCountry: string;
  deliveryPartnerId?: string | DeliveryPartner;
  amount: number;
  totalAmount: number; // amount + delivery charge (if delivery partner selected)
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing price listings
export interface ListPriceListingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromCountry?: string;
  toCountry?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a price listing
export interface CreatePriceListingPayload {
  fromCountry: string;
  toCountry: string;
  deliveryPartnerId?: string;
  amount: number;
  status: 'Active' | 'Inactive';
}

export interface UpdatePriceListingPayload extends Partial<CreatePriceListingPayload> {
  isActive?: boolean;
}

// Price listing service with all CRUD operations
export const priceListingService = {
  // Fetch all price listings with pagination and filters
  async listPriceListings(params: ListPriceListingsParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.fromCountry) queryParams.append('fromCountry', params.fromCountry);
    if (params.toCountry) queryParams.append('toCountry', params.toCountry);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<PriceListing>>(`/price-listings${queryString}`);
  },

  // Fetch a single price listing by ID
  async getPriceListing(id: string) {
    return apiClient.get<ApiResponse<PriceListing>>(`/price-listings/${id}`);
  },

  // Create a new price listing
  async createPriceListing(priceListing: CreatePriceListingPayload) {
    return apiClient.post<ApiResponse<PriceListing>>('/price-listings', priceListing);
  },

  // Update an existing price listing
  async updatePriceListing(id: string, priceListing: UpdatePriceListingPayload) {
    return apiClient.put<ApiResponse<PriceListing>>(`/price-listings/${id}`, priceListing);
  },

  // Delete a price listing
  async deletePriceListing(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/price-listings/${id}`);
  }
};