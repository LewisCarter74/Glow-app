
import Cookies from 'js-cookie';

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
    throw new Error(errorData.message || 'An error occurred');
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Authentication
export const login = (credentials: LoginCredentials) => request('/salon/login/', { method: 'POST', body: credentials });
export const register = (userData: object) => request('/salon/register/', { method: 'POST', body: userData });
export const getProfile = () => request('/salon/profile/');
export const updateProfile = (profileData: any) => request('/salon/profile/', { method: 'PUT', body: profileData });


// Services
export const getServices = () => request('/salon/services/');
export const getService = (id: number) => request(`/salon/services/${id}/`);
export const createService = (data: object) => request('/salon/services/', { method: 'POST', body: data });
export const updateService = (id: number, data: object) => request(`/salon/services/${id}/`, { method: 'PUT', body: data });
export const deleteService = (id: number) => request(`/salon/services/${id}/`, { method: 'DELETE' });


// Stylists
export const getStylists = () => request('/salon/stylists/');
export const getStylist = (id: number) => request(`/salon/stylists/${id}/`);
export const getAvailableStylists = (serviceId: number) => request(`/salon/stylists/available-for-service/?service_id=${serviceId}`);


// Appointments
export const getAppointments = () => request('/salon/appointments/');
export const createAppointment = (appointmentData: object) => request('/salon/appointments/', { method: 'POST', body: appointmentData });
export const cancelAppointment = (id: number) => request(`/salon/appointments/${id}/cancel/`, { method: 'POST' });
export const getAvailability = (params: { date: string, service_ids: string, stylist_id?: string }) => {
    const urlParams = new URLSearchParams(params as any).toString();
    return request(`/salon/appointments/availability/?${urlParams}`);
};


// Reviews
export const getReviews = (stylistId?: number) => {
    const url = stylistId ? `/salon/reviews/?stylist_id=${stylistId}` : '/salon/reviews/';
    return request(url);
};
export const createReview = (reviewData: object) => request('/salon/reviews/', { method: 'POST', body: reviewData });


// Promotions
export const getPromotions = () => request('/salon/promotions/');

// Inspired Work
export const getInspiredWork = () => request('/salon/inspired-work/');


// Favorites
export const getFavorites = () => request('/salon/favorites/');
export const addFavorite = (stylistId: number) => request('/salon/favorites/', { method: 'POST', body: { stylist: stylistId } });
export const removeFavorite = (stylistId: number) => request(`/salon/favorites/${stylistId}/`, { method: 'DELETE' });


// User Account Management
export const getReferralInfo = () => request('/salon/referrals/');
export const requestPasswordReset = (email: string) => request('/salon/password-reset/', { method: 'POST', body: { email } });
export const confirmPasswordReset = (data: object) => request('/salon/password-reset/confirm/', { method: 'POST', body: data });

// Loyalty Points
export const getLoyaltyPoints = () => request('/salon/loyalty-points/');
export const redeemLoyaltyPoints = (amount: number) => request('/salon/loyalty-points/redeem/', { method: 'POST', body: { amount } });
