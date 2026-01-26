import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

export interface PackingListInput {
  bookingReference: string;
  netWeight: number;
  grossWeight: number;
  packedBy: string;
  plannedBundleCount: number;
  actualBundleCount?: number;
  packingStatus?: 'pending' | 'in_progress' | 'completed';
}

export interface PackingList {
  _id: string;
  id?: string;
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
  packingListCode: string;
  netWeight: number;
  grossWeight: number;
  packedBy: string;
  plannedBundleCount: number;
  actualBundleCount: number;
  packingStatus: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const packingListService = {
  async list(params: { page?: number; limit?: number; packingStatus?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.packingStatus && params.packingStatus !== 'all') query.append('packingStatus', params.packingStatus);
    if (params.search) query.append('search', params.search);

    const path = `/packing-lists${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiListResponse<PackingList>>(path);
  },

  async get(id: string) {
    return apiClient.get<ApiResponse<PackingList>>(`/packing-lists/${id}`);
  },

  async create(payload: PackingListInput) {
    return apiClient.post<ApiResponse<PackingList>>('/packing-lists', payload);
  },

  async update(id: string, payload: Partial<PackingListInput>) {
    return apiClient.put<ApiResponse<PackingList>>(`/packing-lists/${id}`, payload);
  },

  async delete(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/packing-lists/${id}`);
  }
};