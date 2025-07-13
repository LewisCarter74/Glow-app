
'use client';

import { useRouter } from 'next/navigation';
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from 'react';

// A simple mock user object
type User = {
  name: string;
  email: string;
};

// The shape of the auth context
type AuthContextType = {
  user: User | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to manage a cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const removeCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=-99999999; path=/;';  
}

// The AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserLoggedIn = useCallback(() => {
    setIsLoading(true);
    const authCookie = getCookie('auth');
    if (authCookie) {
      setUser({ name: 'Ada Lovelace', email: 'ada@example.com' });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]);

  const signIn = async (email: string, pass: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // This is where you would handle the actual login logic
    // For now, we'll just set a mock user and a cookie
    const mockUser: User = { name: 'Ada Lovelace', email: email };
    setCookie('auth', 'true');
    setUser(mockUser);
  };

  const signOut = () => {
    // Clear the user and the cookie
    removeCookie('auth');
    setUser(null);
  };

  const value = {
    user,
    signIn,
    signOut,
    isLoading,
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
