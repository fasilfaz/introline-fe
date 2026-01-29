import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

export interface Container {
  _id?: string;
  containerCode: string;
  companyName: string;
  bookingDate: string;
  cutOffDate?: string;
  etaCok?: string;
  etdCok?: string;
  etaJea?: string;
  bookingCharge: number;
  advancePayment: number;
  balanceAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContainerPayload {
  companyName: string;
  bookingDate: string;
  cutOffDate?: string;
  etaCok?: string;
  etdCok?: string;
  etaJea?: string;
  bookingCharge: number;
  advancePayment?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface UpdateContainerPayload {
  companyName?: string;
  bookingDate?: string;
  cutOffDate?: string;
  etaCok?: string;
  etdCok?: string;
  etaJea?: string;
  bookingCharge?: number;
  advancePayment?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface ListContainersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Container service with all CRUD operations
export const containerService = {
  // Fetch all containers with pagination and filters
  async listContainers(params: ListContainersParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<Container>>(`/containers${queryString}`);
  },

  // Fetch a single container by ID
  async getContainer(id: string) {
    return apiClient.get<ApiResponse<Container>>(`/containers/${id}`);
  },

  // Create a new container
  async createContainer(container: CreateContainerPayload) {
    return apiClient.post<ApiResponse<Container>>('/containers', container);
  },

  // Update an existing container
  async updateContainer(id: string, container: UpdateContainerPayload) {
    return apiClient.put<ApiResponse<Container>>(`/containers/${id}`, container);
  },

  // Delete a container
  async deleteContainer(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/containers/${id}`);
  }
};