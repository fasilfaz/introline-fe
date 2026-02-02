import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

export interface BillBundle {
  _id: string;
  bundleNumber: string;
  description?: string;
  quantity: number;
  netWeight?: number;
  grossWeight?: number;
  products: Array<{
    id: string;
    productName: string;
    productQuantity: number;
    fabric: string;
    description: string;
  }>;
  packingList: {
    _id: string;
    packingListCode: string;
    bookingReference?: {
      _id: string;
      bookingCode: string;
      sender?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      };
      receiver?: {
        _id: string;
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      };
    };
  };
}

export interface BillDeliveryPartner {
  _id: string;
  name: string;
  phoneNumber: string;
  price: number;
  fromCountry: string;
  toCountry: string;
}

export interface Bill {
  _id: string;
  billNumber: string;
  bundle: BillBundle;
  deliveryPartner: BillDeliveryPartner;
  lrNumber: string;
  deliveryCharge: number;
  totalAmount: number;
  status: 'draft' | 'generated' | 'paid' | 'cancelled';
  generatedAt: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateBillInput {
  bundleId: string;
  deliveryPartnerId: string;
  lrNumber: string;
  deliveryCharge: number;
}

export interface BillStats {
  totalBills: number;
  totalAmount: number;
  statusCounts: {
    draft?: number;
    generated?: number;
    paid?: number;
    cancelled?: number;
  };
}

export interface BillPrintData {
  billNumber: string;
  generatedAt: string;
  lrNumber: string;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  bundle: {
    bundleNumber: string;
    description?: string;
    quantity: number;
    netWeight?: number;
    grossWeight?: number;
    packingListCode: string;
    products?: Array<{
      id: string;
      productName: string;
      productQuantity: number;
      fabric?: string;
      description?: string;
    }>;
  };
  customer: {
    sender?: {
      _id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    receiver?: {
      _id: string;
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  deliveryPartner: {
    name: string;
    phoneNumber: string;
    fromCountry: string;
    toCountry: string;
  };
}

export const billService = {
  async list(params: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    search?: string;
    from?: string;
    to?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    const path = `/bills${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiListResponse<Bill>>(path);
  },

  async get(id: string) {
    return apiClient.get<ApiResponse<Bill>>(`/bills/${id}`);
  },

  async generate(payload: GenerateBillInput) {
    return apiClient.post<ApiResponse<Bill>>('/bills', payload);
  },

  async update(id: string, payload: Partial<GenerateBillInput>) {
    return apiClient.put<ApiResponse<Bill>>(`/bills/${id}`, payload);
  },

  async cancel(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/bills/${id}`);
  },

  async getPrintData(id: string) {
    return apiClient.get<ApiResponse<BillPrintData>>(`/bills/${id}/print`);
  },

  async getStats(params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    const path = `/bills/stats${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<BillStats>>(path);
  }
};