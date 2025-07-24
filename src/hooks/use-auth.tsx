'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchUserProfile,
} from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

// Define the User type
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'stylist' | 'admin';
  referral_code?: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: object) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create the AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    setIsLoading(true);
    try {
      // Check for access token to determine if user might be logged in
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Attempt to fetch user profile
        const userProfile = await fetchUserProfile();
        setUser(userProfile);
      }
    } catch (error) {
      // This can happen if the token is expired/invalid.
      // It's a normal part of the flow, so we just clear the user.
      console.warn('Could not load user profile, logging out.', error);
      setUser(null);
      // Clean up invalid token from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password);
    setUser(loggedInUser);
  };

  const register = async (userData: object) => {
    await registerUser(userData);
    // After registration, the user still needs to log in
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    // Redirect to login page after logout
    router.push('/login');
  };

  const reloadUser = async () => {
    await loadUser();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    reloadUser,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
