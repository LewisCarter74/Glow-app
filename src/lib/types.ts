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
  
  export interface Stylist {
    id: number;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    bio: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    portfolio: string[];
    imageUrl: string;
    is_featured: boolean;
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
    customer_name: string;
    stylist_name: string;
    created_at: string;
  }
  
  export interface LoyaltyPoints {
    points: number;
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
    role: string;
  }
  
  export interface Referral {
    id: number;
    referred_user: {
      name: string;
    };
    created_at: string;
  }
  
  export interface ReferralInfo {
    referral_code: string;
    referral_link: string;
    referrals_made: Referral[];
    referral_bonus_info: string;
  }
  
  export interface InspiredWork {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    created_at: string;
  }
  