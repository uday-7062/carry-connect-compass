
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard as AdminDashboardComponent } from '@/components/admin/AdminDashboard';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    console.log("User is not an admin, redirecting to dashboard.");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardComponent />
    </div>
  );
}
