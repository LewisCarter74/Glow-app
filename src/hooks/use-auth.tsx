'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, login as apiLogin, register as apiRegister } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_image_url: string;
  referral_code: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: object) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
  register: (userData: object) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          const data = await getProfile();
          setUser(data);
        } catch (error) {
          console.error('Failed to load user, logging out.', error);
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials: object) => {
    try {
        const { access, refresh, user: userData } = await apiLogin(credentials);
        Cookies.set('access_token', access, { secure: true, sameSite: 'strict' });
        Cookies.set('refresh_token', refresh, { secure: true, sameSite: 'strict' });
        setUser(userData);
        router.push('/');
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
  };

  const register = async (userData: object) => {
    try {
      return await apiRegister(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setUser(null);
    router.push('/login');
  };

  const reloadUser = async () => {
    setIsLoading(true);
    try {
        const data = await getProfile();
        setUser(data);
    } catch (error) {
        console.error('Failed to reload user:', error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    reloadUser,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
