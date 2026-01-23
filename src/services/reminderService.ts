import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Define the Reminder interface to match the backend model
export interface Reminder {
  _id?: string;
  date: string;
  description: string;
  purpose: string;
  whatsapp: boolean;
  customer?: any;
  customerId?: string;
  customerName?: string;
  customerWhatsappNumber?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
  whatsappError?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing reminders
export interface ListRemindersParams {
  page?: number;
  limit?: number;
  search?: string;
  whatsapp?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a reminder
export interface CreateReminderPayload {
  date: string;
  description: string;
  purpose: string;
  whatsapp: boolean;
  customerId?: string;
}

export interface UpdateReminderPayload extends Partial<CreateReminderPayload> { }

// Reminder service with all CRUD operations
export const reminderService = {
  // Fetch all reminders with pagination and filters
  async listReminders(params: ListRemindersParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.whatsapp) queryParams.append('whatsapp', params.whatsapp);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<Reminder>>(`/reminders${queryString}`);
  },

  // Fetch a single reminder by ID
  async getReminder(id: string) {
    return apiClient.get<ApiResponse<Reminder>>(`/reminders/${id}`);
  },

  // Create a new reminder
  async createReminder(reminder: CreateReminderPayload) {
    return apiClient.post<ApiResponse<Reminder>>('/reminders', reminder);
  },

  // Update an existing reminder
  async updateReminder(id: string, reminder: UpdateReminderPayload) {
    return apiClient.put<ApiResponse<Reminder>>(`/reminders/${id}`, reminder);
  },

  // Delete a reminder
  async deleteReminder(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/reminders/${id}`);
  }
};