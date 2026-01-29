import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

export interface PackingListInput {
  bookingReference: string;
  netWeight: number;
  grossWeight: number;
  packedBy: string;
  plannedBundleCount: number;
  packingStatus?: 'pending' | 'in_progress' | 'completed';
  count?: number;
  bundles?: Array<{
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
  }>;
}

// Extended interface for backward compatibility with old packing list system
export interface PackingList {
  _id: string;
  id?: string;
  // New booking-integrated fields
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
  count?: number;
  bundles?: Array<{
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
  }>;

  createdAt: string;
  updatedAt: string;

  // Legacy fields for backward compatibility with old system
  boxNumber?: string;
  store?: {
    _id: string;
    name: string;
    code: string;
  };
  toStore?: {
    _id: string;
    name: string;
    code: string;
  };
  items?: Array<{
    _id?: string;
    product?: {
      _id: string;
      name: string;
      code?: string;
      description?: string;
      unitOfMeasure?: string;
    };
    productId?: string;
    quantity: number;
    description?: string;
    unitOfMeasure?: string;
  }>;
  status?: 'india' | 'uae';
  approvalStatus?: 'draft' | 'approved';
  packingDate?: string;
  shipmentDate?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  totalQuantity?: number;
  cargoNumber?: string;
  fabricDetails?: string;
}

export const packingListService = {
  async list(params: { page?: number; limit?: number; packingStatus?: string; search?: string; status?: string; approvalStatus?: string } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.packingStatus && params.packingStatus !== 'all') query.append('packingStatus', params.packingStatus);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.approvalStatus && params.approvalStatus !== 'all') query.append('approvalStatus', params.approvalStatus);
    if (params.search) query.append('search', params.search);

    const path = `/packing-lists${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiListResponse<PackingList>>(path);
  },

  async get(id: string) {
    return apiClient.get<ApiResponse<PackingList>>(`/packing-lists/${id}`);
  },

  async create(payload: PackingListInput | any) {
    return apiClient.post<ApiResponse<PackingList>>('/packing-lists', payload);
  },

  async update(id: string, payload: Partial<PackingListInput> | any) {
    return apiClient.put<ApiResponse<PackingList>>(`/packing-lists/${id}`, payload);
  },

  async delete(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/packing-lists/${id}`);
  },

  // Legacy method for backward compatibility
  async approve(id: string) {
    return apiClient.put<ApiResponse<PackingList>>(`/packing-lists/${id}`, { approvalStatus: 'approved' });
  }
};