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

export async function fetchServices() {
  try {
    const response = await fetch(`${BASE_URL}/services/`); // Use raw fetch
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
  } catch (error) {
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
  console.log('User logged out.');
  // Potentially redirect to login page after logout
};
