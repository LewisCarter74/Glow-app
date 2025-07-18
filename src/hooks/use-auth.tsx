
'use client';

import {
  useState,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser, fetchUserProfile as apiFetchUserProfile } from '@/lib/api';

// Define the User type based on your UserSerializer response
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  name: string;
  profile_image_url: string | null;
}

// The shape of the auth context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // Indicates if auth state is being loaded (e.g., from localStorage)
  isAuthenticated: boolean; // Convenience derived state
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true, as we'll load from local storage

  // On initial mount, try to load user from local storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          // Optionally, verify token or fetch fresh profile for validity
          // For now, trust local storage for initial load
          setUser(JSON.parse(storedUser));
          
          // You might want to refresh the profile in the background to ensure token validity
          // try {
          //   const freshProfile = await apiFetchUserProfile();
          //   setUser(freshProfile);
          // } catch (refreshError) {
          //   console.error("Failed to refresh user profile on load, logging out:", refreshError);
          //   apiLogoutUser(); // Clear invalid session
          //   setUser(null);
          // }

        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load user from local storage:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await apiLoginUser(email, password);
      setUser(userData);
    } catch (error) {
      setUser(null); // Ensure user is null on login failure
      throw error; // Re-throw to be caught by UI components
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiLogoutUser(); // Clear tokens from local storage
    setUser(null); // Clear user state
  }, []);

  const isAuthenticated = !!user; // Derived state

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
