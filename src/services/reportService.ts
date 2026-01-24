import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/backend';

export const reportService = {
  async purchase(params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const path = `/reports/purchases${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any[]>>(path);
  },

  async stock() {
    return apiClient.get<ApiResponse<any[]>>('/reports/stock');
  },

  async sales(params: { customerId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.customerId) query.append('customerId', params.customerId);
    const path = `/reports/sales${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any[]>>(path);
  },

  async expenses() {
    return apiClient.get<ApiResponse<any[]>>('/reports/expenses');
  },

  async packingLists(params: { from?: string; to?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const path = `/reports/packing-lists${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any[]>>(path);
  },

  // New report methods
  async customers(params: { from?: string; to?: string; customerType?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.customerType) query.append('customerType', params.customerType);
    const path = `/reports/customers${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any[]>>(path);
  },

  async containers(params: { from?: string; to?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.status) query.append('status', params.status);
    const path = `/reports/containers${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any>>(path);
  },

  async deliveryPartners(params: { from?: string; to?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.status) query.append('status', params.status);
    const path = `/reports/delivery-partners${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any>>(path);
  },

  async pickupPartners(params: { from?: string; to?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.status) query.append('status', params.status);
    const path = `/reports/pickup-partners${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any>>(path);
  },

  async bookings(params: { from?: string; to?: string; status?: string; sender?: string; receiver?: string } = {}) {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.status) query.append('status', params.status);
    if (params.sender) query.append('sender', params.sender);
    if (params.receiver) query.append('receiver', params.receiver);
    const path = `/reports/bookings${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ApiResponse<any>>(path);
  }
};

