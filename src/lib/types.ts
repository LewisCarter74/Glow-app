export interface Service {
    id: number;
    name: string;
    description: string;
    price: string;
    duration_minutes: number;
    category: number;
    category_name: string;
    imageUrl: string;
    is_active: boolean;
  }
  
  export interface Category {
    id: number;
    name:string;
    service_count: number;
  }

  export interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    profile_image_url: string;
    referral_code: string;
    name: string;
    role: 'customer' | 'stylist' | 'admin';
  }
  
  export interface Stylist {
    id: number;
    user: UserProfile;
    bio: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    portfolio: string[];
    imageUrl: string;
    is_featured: boolean;
    is_favorited: boolean;
  }
  
  export interface Appointment {
    id: number;
    customer: UserProfile;
    stylist: Stylist;
    services: Service[];
    appointment_date: string;
    appointment_time: string;
    duration_minutes: number;
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    can_review: boolean;
    created_at: string;
  }
  
  export interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    customer_name: string;
    stylist_name: string;
  }
  
  export interface Promotion {
    id: number;
    title: string;
    description: string;
    code: string;
    discount_percentage: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
  }
  
  export interface LoyaltyPoints {
      points: number;
  }
  
  export interface ReferralInfo {
      referral_code: string;
      referral_link: string;
      referrals_made: any[];
      referral_bonus_info: string;
  }

  export interface InspiredWork {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    created_at: string;
  }
  