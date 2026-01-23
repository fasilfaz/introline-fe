import { ApiResponse, PaginatedResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface Container {
  _id?: string;
  containerCode: string;
  companyName: string;
  bookingDate: string;
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
  bookingCharge: number;
  advancePayment?: number;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface UpdateContainerPayload {
  companyName?: string;
  bookingDate?: string;
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

class ContainerService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/containers${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Container service request failed:', error);
      throw error;
    }
  }

  async listContainers(params: ListContainersParams = {}): Promise<PaginatedResponse<Container>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<Container[]>(endpoint);
  }

  async getContainer(id: string): Promise<ApiResponse<Container>> {
    return this.request<Container>(`/${id}`);
  }

  async createContainer(data: CreateContainerPayload): Promise<ApiResponse<Container>> {
    return this.request<Container>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContainer(id: string, data: UpdateContainerPayload): Promise<ApiResponse<Container>> {
    return this.request<Container>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContainer(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const containerService = new ContainerService();