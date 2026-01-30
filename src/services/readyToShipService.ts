import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';
import type { Bundle } from './bundleService';

export interface ReadyToShipBundle extends Omit<Bundle, 'packingList'> {
  // Omitting packingList since Ready to Ship doesn't need that data
  packingList: never; // Explicitly exclude packingList
  priority: 'high' | 'medium' | 'low';
  readyToShipStatus: 'pending' | 'stuffed' | 'dispatched';
  container?: {
    _id: string;
    containerCode: string;
  };
}

export interface ReadyToShipStats {
  totalBundles: number;
  totalQuantity: number;
  totalNetWeight: number;
  totalGrossWeight: number;
  totalProducts: number;
}

export interface ReadyToShipBundleUpdate {
  bundleNumber?: string;
  description?: string;
  quantity?: number;
  netWeight?: number;
  grossWeight?: number;
  actualCount?: number;
  priority?: 'high' | 'medium' | 'low';
  readyToShipStatus?: 'pending' | 'stuffed' | 'dispatched';
  bundleType?: 'box' | 'bale';
  container?: string; // container ID
  products?: Array<{
    id: string;
    productName: string;
    productQuantity: number;
    fabric: string;
    description: string;
  }>;
}

export const readyToShipService = {
  async list(params: { 
    page?: number; 
    limit?: number; 
    search?: string;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
    priority?: string;
    readyToShipStatus?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.sortField) query.append('sortField', params.sortField);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.priority) query.append('priority', params.priority);
    if (params.readyToShipStatus) query.append('readyToShipStatus', params.readyToShipStatus);

    const path = `/ready-to-ship${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiListResponse<ReadyToShipBundle>>(path);
  },

  async get(id: string) {
    return apiClient.get<ApiResponse<ReadyToShipBundle>>(`/ready-to-ship/${id}`);
  },

  async update(id: string, payload: ReadyToShipBundleUpdate) {
    return apiClient.put<ApiResponse<ReadyToShipBundle>>(`/ready-to-ship/${id}`, payload);
  },

  async getStats() {
    return apiClient.get<ApiResponse<ReadyToShipStats>>('/ready-to-ship/stats');
  }
};