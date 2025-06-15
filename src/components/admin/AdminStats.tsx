
import { Card, CardContent } from '@/components/ui/card';
import { Users, AlertTriangle, FileText, Check } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    pendingReports: number;
    pendingVerifications: number;
    resolvedToday: number;
  };
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
          <div className="text-2xl font-bold">{stats.pendingReports}</div>
          <div className="text-sm text-gray-600">Pending Reports</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
          <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
          <div className="text-sm text-gray-600">Pending Verifications</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <Check className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold">{stats.resolvedToday}</div>
          <div className="text-sm text-gray-600">Resolved Today</div>
        </CardContent>
      </Card>
    </div>
  );
};
