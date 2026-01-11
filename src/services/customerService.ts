import { apiClient } from './apiClient';
import type { ApiListResponse, ApiResponse } from '@/types/backend';

// Branch interface for receiver customers
export interface Branch {
  branchName: string;
  location: string;
  phone?: string;
  contactPerson?: string;
}

// Account details interface for sender customers
export interface AccountDetails {
  accountNumber?: string;
  ifscCode?: string;
  ibanCode?: string;
  bankName?: string;
  accountHolderName?: string;
  swiftCode?: string;
}

// Payment history interface for receiver customers
export interface PaymentHistory {
  date: string;
  amount: number;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
}

// Define the Customer interface to match the backend model
export interface Customer {
  _id?: string;
  customerType: 'Sender' | 'Receiver';
  name: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  
  // Common fields
  shopName?: string;
  contactPerson?: string;
  
  // Sender specific fields
  location?: string;
  gstNumber?: string;
  whatsappNumber?: string;
  accountDetails?: AccountDetails;
  
  // Receiver specific fields
  branches?: Branch[];
  phone?: string;
  credit?: number;
  country?: string;
  address?: string;
  discount?: number;
  paymentHistory?: PaymentHistory[];
  
  createdAt?: string;
  updatedAt?: string;
}

// Define the parameters for listing customers
export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the payload for creating/updating a customer
export interface CreateCustomerPayload {
  customerType: 'Sender' | 'Receiver';
  name: string;
  status: 'Active' | 'Inactive';
  
  // Common fields
  shopName?: string;
  contactPerson?: string;
  
  // Sender specific fields
  location?: string;
  gstNumber?: string;
  whatsappNumber?: string;
  accountDetails?: AccountDetails;
  
  // Receiver specific fields
  branches?: Branch[];
  phone?: string;
  credit?: number;
  country?: string;
  address?: string;
  discount?: number;
  paymentHistory?: PaymentHistory[];
}

export interface UpdateCustomerPayload extends Partial<CreateCustomerPayload> {
  isActive?: boolean;
}

// Customer service with all CRUD operations
export const customerService = {
  // Fetch all customers with pagination and filters
  async listCustomers(params: ListCustomersParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.customerType) queryParams.append('customerType', params.customerType);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<ApiListResponse<Customer>>(`/customers${queryString}`);
  },

  // Fetch a single customer by ID
  async getCustomer(id: string) {
    return apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
  },

  // Create a new customer
  async createCustomer(customer: CreateCustomerPayload) {
    return apiClient.post<ApiResponse<Customer>>('/customers', customer);
  },

  // Update an existing customer
  async updateCustomer(id: string, customer: UpdateCustomerPayload) {
    return apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customer);
  },

  // Delete a customer (soft delete - sets isActive to false)
  async deleteCustomer(id: string) {
    return apiClient.delete<ApiResponse<{ success: boolean }>>(`/customers/${id}`);
  }
};