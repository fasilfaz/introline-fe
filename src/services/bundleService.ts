import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

export interface BundleInput {
  packingListId: string;
  bundleNumber: string;
  description?: string;
  quantity: number;
  netWeight?: number;
  grossWeight?: number;
  actualCount?: number;
  status?: 'pending' | 'in_progress' | 'completed';
  products?: Array<{
    id: string;
    productName: string;
    productQuantity: number;
    fabric: string;
    description: string;
  }>;
}

export interface Bundle {
  _id: string;
  id?: string;
  packingList: {
    _id: string;
    packingListCode: string;
    bookingReference?: {
      _id: string;
      sender?: {
        _id: string;
        name: string;
        email?: string;
      };
      receiver?: {
        _id: string;
        name: string;
        email?: string;
      };
      pickupPartner?: {
        _id: string;
        name: string;
      };
      date?: string;
      expectedReceivingDate?: string;
      bundleCount?: number;
      status?: string;
    };
  };
  bundleNumber: string;
  description?: string;
  quantity: number;
  netWeight?: number;
  grossWeight?: number;
  actualCount?: number;
  status: 'pending' | 'in_progress' | 'completed';
  products: Array<{
    id: string;
    productName: string;
    productQuantity: number;
    fabric: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BundleStats {
  totalBundles: number;
  totalQuantity: number;
  totalNetWeight: number;
  totalGrossWeight: number;
  totalProducts: number;
  statusCounts: {
    pending?: number;
    in_progress?: number;
    completed?: number;
  };
}

export const bundleService = {
  async list(params: { 
    page?: number; 
    limit?: number; 
    packingListId?: string; 
    status?: string; 
    search?: string 
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.packingListId) query.append('packingListId', params.packingListId);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const path = `/bundles${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiListResponse<Bundle>>(path);
  },

  async get(id: string) {
    return apiClient.get<ApiResponse<Bundle>>(`/bundles/${id}`);
  },

  async create(payload: BundleInput) {
    return apiClient.post<ApiResponse<Bundle>>('/bundles', payload);
  },

  async update(id: string, payload: Partial<BundleInput>) {
    return apiClient.put<ApiResponse<Bundle>>(`/bundles/${id}`, payload);
  },

  async delete(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/bundles/${id}`);
  },

  async getByPackingList(packingListId: string) {
    return apiClient.get<ApiResponse<Bundle[]>>(`/bundles/packing-list/${packingListId}`);
  },

  async getStats(packingListId: string) {
    return apiClient.get<ApiResponse<BundleStats>>(`/bundles/packing-list/${packingListId}/stats`);
  }
};