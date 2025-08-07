import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdminGuide as AdminGuideComponent } from '@/components/admin/AdminGuide';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminCheck } from '@/hooks/use-role-check';

function AdminGuideContent() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const { profile } = useAdminCheck();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 py-16">
        <AdminGuideComponent />
      </main>
      
      <Footer />
    </div>
  );
}

export default function AdminGuide() {
  return (
    <ProtectedRoute allowedRoles={['administrator']}>
      <AdminGuideContent />
    </ProtectedRoute>
  );
}