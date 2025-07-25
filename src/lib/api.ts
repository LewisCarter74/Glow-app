import Cookies from 'js-cookie';
import { Appointment, Service, Stylist, Review, LoyaltyPoints, UserProfile, Category, ReferralInfo, InspiredWork } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(endpoint: string, options: RequestInit = {}) {
    const token = Cookies.get('access_token');
    
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    
    let body = options.body;

    if (body instanceof FormData) {
        headers.delete('Content-Type');
    } else if (body && typeof body !== 'string') {
        body = JSON.stringify(body);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
    }

    const config: RequestInit = {
        ...options,
        headers,
        body,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { detail: response.statusText };
            }
            const message = errorData.detail || `An error occurred: ${response.statusText}`;
            throw new Error(message);
        }
        
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

const get = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'GET' });
const post = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: 'POST', body });
const put = (endpoint: string, body: any, options?: RequestInit) => request(endpoint, { ...options, method: 'PUT', body });
const del_ = (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'DELETE' });

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const login = (credentials: object) => post('/api/salon/login/', credentials);
export const register = (userData: object) => post('/api/salon/register/', userData);
export const requestPasswordReset = (email: object) => post('/api/salon/password-reset/', email);
export const confirmPasswordReset = (data: object) => post('/api/salon/password-reset/confirm/', data);

// ============================================================================
// USER PROFILE
// ============================================================================

export const getProfile = (): Promise<UserProfile> => get('/api/salon/profile/');
export const updateProfile = (profileData: FormData): Promise<UserProfile> => {
    return put('/api/salon/profile/', profileData);
};

// ============================================================================
// SERVICES & CATEGORIES
// ============================================================================

export const getServices = (): Promise<Service[]> => get('/api/salon/services/');
export const getService = (id: number): Promise<Service> => get(`/api/salon/services/${id}/`);
export const getCategories = (): Promise<Category[]> => get('/api/salon/categories/');

// ============================================================================
// STYLISTS
// =================================S===========================================

export const getStylists = (): Promise<Stylist[]> => get('/api/salon/stylists/');
export const getStylist = (id: number): Promise<Stylist> => get(`/api/salon/stylists/${id}/`);
export const getAvailableStylistsForService = (serviceId: number): Promise<Stylist[]> => {
    return get(`/api/salon/stylists/available-for-service/?service_id=${serviceId}`);
};
export const getFavoriteStylists = (): Promise<any[]> => get('/api/salon/favorites/');
export const addFavoriteStylist = (stylistId: number): Promise<any> => post('/api/salon/favorites/', { stylist_id: stylistId });
export const removeFavoriteStylist = (stylistId: number): Promise<any> => del_(`/api/salon/favorites/${stylistId}/`);

// ============================================================================
// APPOINTMENTS & BOOKING
// ============================================================================

export const getAppointments = (): Promise<Appointment[]> => get('/api/salon/appointments/');
export const createAppointment = (appointmentData: object): Promise<Appointment> => post('/api/salon/appointments/', appointmentData);
export const cancelAppointment = (id: number): Promise<any> => post(`/api/salon/appointments/${id}/cancel/`, {});
export const getAvailability = (date: string, serviceIds: number[], stylistId?: number): Promise<any> => {
    const params = new URLSearchParams({ date, service_ids: serviceIds.join(',') });
    if (stylistId) {
        params.append('stylist_id', stylistId.toString());
    }
    return get(`/api/salon/appointments/availability/?${params.toString()}`);
};

// ============================================================================
// REVIEWS
// ============================================================================

export const getReviews = (stylistId?: number): Promise<Review[]> => {
    const url = stylistId ? `/api/salon/reviews/?stylist_id=${stylistId}` : '/api/salon/reviews/';
    return get(url);
};
export const leaveReview = (reviewData: object): Promise<Review> => post('/api/salon/reviews/', reviewData);


// ============================================================================
// LOYALTY & REFERRALS
// ============================================================================

export const getLoyaltyPoints = (): Promise<LoyaltyPoints> => get('/api/salon/loyalty-points/');
export const redeemLoyaltyPoints = (data: { amount: number }): Promise<{ message: string; new_loyalty_points: number }> => {
    return post('/api/salon/loyalty-points/redeem/', data);
};
export const getReferralInfo = (): Promise<ReferralInfo> => get('/api/salon/referrals/');

// ============================================================================
// AI & Inspired Work
// ============================================================================

export const getAIRecommendations = (preferences?: string, image?: File): Promise<{ task_id: string }> => {
    const formData = new FormData();
    if (preferences) formData.append('preferences', preferences);
    if (image) formData.append('image', image);
    return post('/api/salon/ai-style-recommendation/', formData);
};

export const getAIRecommendationResult = (taskId: string): Promise<any> => {
    return get(`/api/salon/ai-style-recommendation/result/${taskId}/`);
};

export const getInspiredWork = (): Promise<InspiredWork[]> => get('/api/salon/inspired-work/');
