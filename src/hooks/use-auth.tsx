
'use client';

import {
  useState,
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
  signIn: (email?: string, pass?: string) => Promise<void>;
  signOut: () => void;
  isLoading: boolean;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // We set isLoading to false because we are not doing any async checks.
  const [isLoading, setIsLoading] = useState(false); 

  const signIn = useCallback(async (email: string = 'ada@example.com', pass?: string) => {
    // In this simplified version, we just set a mock user.
    const mockUser: User = { name: 'Ada Lovelace', email: email };
    setUser(mockUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

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
