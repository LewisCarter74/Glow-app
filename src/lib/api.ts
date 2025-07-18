const BASE_URL = 'http://127.0.0.1:8000/api'; // Changed to direct port 8000 for testing as requested

// Helper to get access token for authenticated requests
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

interface AuthenticatedFetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

// Helper for authenticated fetch requests
async function authenticatedFetch(url: string, options: AuthenticatedFetchOptions = {}) {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers || {}), // Ensure headers object exists
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Basic error handling for unauthorized requests
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error: Access token might be expired or invalid.');
    }
    const errorData = await response.json();
    throw new Error(errorData.detail || JSON.stringify(errorData));
  }

  return response;
}

// Existing functions (now using raw fetch for public endpoints initially)

export async function fetchStylists() {
  try {
    const response = await fetch(`${BASE_URL}/stylists/`); // Use raw fetch
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching stylists:", error);
    return [];
  }
}

export async function fetchStylistById(id: string) {
  // This might still need authentication depending on view permissions
  try {
    const response = await fetch(`${BASE_URL}/stylists/${id}/`); 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching stylist with id ${id}:`, error);
    return null;
  }
}

export async function fetchPromotions() {
  try {
    const response = await fetch(`${BASE_URL}/promotions/`); // Use raw fetch
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}


// Authentication Functions (already using fetch or authenticatedFetch correctly)

export async function registerUser(userData: object) {
  try {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Login successful:', data);

    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) { // Corrected from 'Catch' to 'catch'
    console.error('Login error:', error);
    throw error;
  }
}

export async function fetchUserProfile() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/profile/`, {
      method: 'GET',
    });

    const data = await response.json();
    console.log('User profile:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  console.log('User logged out. localStorage items cleared.');
  console.log('localStorage after logout - accessToken:', localStorage.getItem('accessToken'));
  console.log('localStorage after logout - refreshToken:', localStorage.getItem('refreshToken'));
  console.log('localStorage after logout - user:', localStorage.getItem('user'));
};

// Password Reset Functions
export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${BASE_URL}/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Password reset email request successful:', data);
    return data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
}

export async function confirmPasswordReset(uid: string, token: string, new_password: string) {
  try {
    const response = await fetch(`${BASE_URL}/password-reset-confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, token, new_password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || JSON.stringify(errorData));
    }

    const data = await response.json();
    console.log('Password reset confirmation successful:', data);
    return data;
  } catch (error) {
    console.error('Error confirming password reset:', error);
    throw error;
  }
}

// Services Endpoints
export async function fetchServices() {
  try {
    const response = await fetch(`${BASE_URL}/services/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function createService(serviceData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/services/`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    console.log('Service created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function fetchServiceById(id: string) {
  try {
    const response = await fetch(`${BASE_URL}/services/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    return null;
  }
}

export async function updateService(id: string, serviceData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/services/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
    const data = await response.json();
    console.log(`Service ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    throw error;
  }
}

export async function deleteService(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/services/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Service ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    throw error;
  }
}

// Stylists Endpoints
export async function createStylist(stylistData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/stylists/`, {
      method: 'POST',
      body: JSON.stringify(stylistData),
    });
    const data = await response.json();
    console.log('Stylist created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating stylist:', error);
    throw error;
  }
}

export async function updateStylist(id: string, stylistData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/stylists/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(stylistData),
    });
    const data = await response.json();
    console.log(`Stylist ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating stylist ${id}:`, error);
    throw error;
  }
}

export async function deleteStylist(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/stylists/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Stylist ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting stylist ${id}:`, error);
    throw error;
  }
}

// Appointments Endpoints
export async function fetchAppointments() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/appointments/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
}

export async function createAppointment(appointmentData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/appointments/`, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
    const data = await response.json();
    console.log('Appointment created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function fetchAppointmentById(id: string) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/appointments/${id}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching appointment with id ${id}:`, error);
    throw error;
  }
}

export async function updateAppointment(id: string, appointmentData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/appointments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
    const data = await response.json();
    console.log(`Appointment ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
}

export async function deleteAppointment(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/appointments/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Appointment ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting appointment ${id}:`, error);
    throw error;
  }
}

// Reviews Endpoints
export async function fetchReviews() {
  try {
    const response = await fetch(`${BASE_URL}/reviews/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(reviewData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    console.log('Review created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function fetchReviewById(id: string) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/reviews/${id}/`); // Assuming reviews by ID might require auth
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching review with id ${id}:`, error);
    return null;
  }
}

export async function updateReview(id: string, reviewData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/reviews/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    console.log(`Review ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating review ${id}:`, error);
    throw error;
  }
}

export async function deleteReview(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/reviews/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Review ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting review ${id}:`, error);
    throw error;
  }
}

// Promotions Endpoints
export async function createPromotion(promotionData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/promotions/`, {
      method: 'POST',
      body: JSON.stringify(promotionData),
    });
    const data = await response.json();
    console.log('Promotion created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
}

export async function updatePromotion(id: string, promotionData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/promotions/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(promotionData),
    });
    const data = await response.json();
    console.log(`Promotion ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating promotion ${id}:`, error);
    throw error;
  }
}

export async function deletePromotion(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/promotions/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Promotion ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting promotion ${id}:`, error);
    throw error;
  }
}

// Loyalty Points Endpoints
export async function fetchLoyaltyPoints() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/loyalty-points/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    throw error;
  }
}

export async function redeemLoyaltyPoints(redeemData: { amount: number }) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/loyalty-points/redeem/`, {
      method: 'POST',
      body: JSON.stringify(redeemData),
    });
    const data = await response.json();
    console.log('Loyalty points redeemed successfully:', data);
    return data;
  } catch (error) {
    console.error('Error redeeming loyalty points:', error);
    throw error;
  }
}

// Analytics Endpoints
export async function fetchAnalytics() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/analytics/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}

// Salon Settings Endpoints
export async function fetchSalonSettings() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/salon-settings/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching salon settings:", error);
    throw error;
  }
}

export async function createSalonSetting(settingData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/salon-settings/`, {
      method: 'POST',
      body: JSON.stringify(settingData),
    });
    const data = await response.json();
    console.log('Salon setting created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating salon setting:', error);
    throw error;
  }
}

export async function updateSalonSetting(id: string, settingData: object) {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/salon-settings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(settingData),
    });
    const data = await response.json();
    console.log(`Salon setting ${id} updated successfully:`, data);
    return data;
  } catch (error) {
    console.error(`Error updating salon setting ${id}:`, error);
    throw error;
  }
}

export async function deleteSalonSetting(id: string) {
  try {
    await authenticatedFetch(`${BASE_URL}/salon-settings/${id}/`, {
      method: 'DELETE',
    });
    console.log(`Salon setting ${id} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting salon setting ${id}:`, error);
    throw error;
  }
}
