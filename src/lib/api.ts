import { get, post, put, del_ } from './api_helpers';
import { Appointment, Service, Stylist, Review, LoyaltyPoints, UserProfile, Category, ReferralInfo, InspiredWork } from './types';

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
// ============================================================================

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
    return post('/api/salon/loyalty-points/', data);
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
