import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Teacher {
  id: string;
  username: string;
  full_name: string;
  email?: string;
}

interface AuthContextType {
  teacher: Teacher | null;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher');
    if (teacherData) {
      setTeacher(JSON.parse(teacherData));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('teacher-auth', {
        body: { action: 'login', username, password }
      });

      if (error) throw error;

      if (data.error) {
        return { error: data.error };
      }

      if (data.teacher) {
        setTeacher(data.teacher);
        localStorage.setItem('teacher', JSON.stringify(data.teacher));
        return {};
      }

      return { error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('teacher');
  };

  return (
    <AuthContext.Provider value={{ teacher, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};