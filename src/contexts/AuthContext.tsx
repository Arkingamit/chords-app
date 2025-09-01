import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, UserRole } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>; // ✅ New method
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user data for demonstration
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    displayName: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as UserRole,
    createdAt: new Date().toISOString(),
    photoURL: ''
  },
  {
    id: '2',
    username: 'editor',
    name: 'Editor User',
    displayName: 'Editor User',
    email: 'editor@example.com',
    password: 'password123',
    role: 'editor' as UserRole,
    createdAt: new Date().toISOString(),
    photoURL: ''
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!user) throw new Error('Invalid email or password');

      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword as User);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      toast({
        title: 'Login successful',
        description: `Welcome back, ${userWithoutPassword.username}!`,
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      if (mockUsers.some((u) => u.email === email)) {
        throw new Error('User with this email already exists');
      }

      const now = new Date().toISOString();
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username,
        name: username,
        displayName: username,
        email,
        role: 'viewer' as UserRole,
        createdAt: now,
        photoURL: ''
      };

      mockUsers.push({ ...newUser, password });
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      toast({
        title: 'Registration successful',
        description: `Welcome, ${username}!`,
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const decoded: any = jwtDecode(credential);

      const googleUser: User = {
        id: decoded.sub,
        username: decoded.name,
        name: decoded.name,
        displayName: decoded.name,
        email: decoded.email,
        photoURL: decoded.picture,
        role: 'viewer',
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(googleUser);
      localStorage.setItem('currentUser', JSON.stringify(googleUser));

      toast({
        title: 'Google Sign-in successful',
        description: `Welcome, ${googleUser.username}!`,
      });
    } catch (error) {
      toast({
        title: 'Google Sign-in failed',
        description: 'Could not process Google login token.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    register,
    loginWithGoogle, // ✅ Export it
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
