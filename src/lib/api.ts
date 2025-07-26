
import Cookies from 'js-cookie';
import { Service, Stylist, Appointment, Review, Category, UserProfile, ReferralInfo, LoyaltyPoints, InspiredWork } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions {
  method?: string;
  headers?: { [key: string]: string };
  body?: any;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const token = Cookies.get('access_token');
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    if (options.body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set Content-Type for FormData
      config.body = options.body;
    } else {
      config.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_URL}${url}`, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData.detail || errorData.message || 'An error occurred');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Authentication
export const login = (credentials: LoginCredentials) => request<any>('/salon/login/', { method: 'POST', body: credentials });
export const register = (userData: object) => request<any>('/salon/register/', { method: 'POST', body: userData });
export const getProfile = () => request<UserProfile>('/salon/profile/');
export const updateProfile = (profileData: any) => request<UserProfile>('/salon/profile/', { method: 'PUT', body: profileData });
export const fetchUserProfile = () => request<UserProfile>('/salon/profile/');
export const logoutUser = () => {
  Cookies.remove('access_token');
  Cookies.remove('refresh_token');
};


// Services
export const getServices = () => request<Service[]>('/salon/services/');
export const getService = (id: number) => request<Service>(`/salon/services/${id}/`);
export const createService = (data: object) => request<Service>('/salon/services/', { method: 'POST', body: data });
export const updateService = (id: number, data: object) => request<Service>(`/salon/services/${id}/`, { method: 'PUT', body: data });
export const deleteService = (id: number) => request<void>(`/salon/services/${id}/`, { method: 'DELETE' });


// Stylists
export const getStylists = () => request<Stylist[]>('/salon/stylists/');
export const getStylist = (id: number) => request<Stylist>(`/salon/stylists/${id}/`);
export const getAvailableStylists = (serviceId: number) => request<Stylist[]>(`/salon/stylists/available-for-service/?service_id=${serviceId}`);


// Appointments
export const getAppointments = () => request<Appointment[]>('/salon/appointments/');
export const createAppointment = (appointmentData: object) => request<Appointment>('/salon/appointments/', { method: 'POST', body: appointmentData });
export const cancelAppointment = (id: number) => request<void>(`/salon/appointments/${id}/cancel/`, { method: 'POST' });
export const getAvailability = (params: { date: string, service_ids: string, stylist_id?: string }) => {
    const urlParams = new URLSearchParams(params as any).toString();
    return request<{[key: number]: {stylist_name: string, slots: string[]}}>(`/salon/appointments/availability/?${urlParams}`);
};


// Reviews
export const getReviews = (stylistId?: number) => {
    const url = stylistId ? `/salon/reviews/?stylist_id=${stylistId}` : '/salon/reviews/';
    return request<Review[]>(url);
};
export const createReview = (reviewData: object) => request<Review>('/salon/reviews/', { method: 'POST', body: reviewData });


// Promotions
export const getPromotions = () => request<any[]>('/salon/promotions/');

// Inspired Work
export const getInspiredWork = () => request<InspiredWork[]>('/salon/inspired-work/');


// Favorites
export const getFavorites = () => request<any[]>('/salon/favorites/');
export const addFavorite = (stylistId: number) => request<any>('/salon/favorites/', { method: 'POST', body: { stylist: stylistId } });
export const removeFavorite = (stylistId: number) => request<void>(`/salon/favorites/${stylistId}/`, { method: 'DELETE' });


// User Account Management
export const getReferralInfo = () => request<ReferralInfo>('/salon/referrals/');
export const requestPasswordReset = (email: string) => request<void>('/salon/password-reset/', { method: 'POST', body: { email } });
export const confirmPasswordReset = (data: object) => request<void>('/salon/password-reset/confirm/', { method: 'POST', body: data });

// Loyalty Points
export const getLoyaltyPoints = () => request<LoyaltyPoints>('/salon/loyalty-points/');
export const redeemLoyaltyPoints = (amount: number) => request<any>('/salon/loyalty-points/redeem/', { method: 'POST', body: { amount } });

// Categories
export const getCategories = () => request<Category[]>('/salon/categories/');
