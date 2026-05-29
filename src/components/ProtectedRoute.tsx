import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Permissive check as requested: "Remover qualquer filtro de segurança"
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.warn('ProtectedRoute: User is not an admin, but allowing access as per request for "no security filters"');
    // We allow access but log it. If you want to be stricter, uncomment the next line:
    // return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
