import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';
import type { Bundle } from './bundleService';

interface PopulatedBooking {
  _id: string;
  bookingCode: string;
  sender: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
  };
  receiver: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    type: string;
  };
  pickupPartner: {
    _id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
  } | 'Self' | 'Central';
  date: string;
  expectedReceivingDate: string;
  bundleCount: number;
  status: 'pending' | 'success';
  repacking: 'ready-to-ship' | 'repacking-required';
  store?: {
    _id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PopulatedPackingList {
  _id: string;
  packingListCode: string;
  bookingReference: PopulatedBooking | null;
  netWeight: number;
  grossWeight: number;
  packedBy: string;
  plannedBundleCount: number;
  actualBundleCount: number;
  packingStatus: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ReadyToShipBundle extends Omit<Bundle, 'packingList'> {
  packingList: PopulatedPackingList;
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