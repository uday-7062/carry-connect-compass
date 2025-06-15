
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Users, FileText, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingReports: 0,
    pendingVerifications: 0,
    resolvedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch user count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch verification requests with user profiles
      const { data: verifications, error: verificationError } = await supabase
        .from('verification_requests')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (verificationError) throw verificationError;

      // Fetch user reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Type-cast the data to ensure proper typing
      const typedVerifications = (verifications || []).map(v => ({
        ...v,
        status: v.status as 'pending' | 'approved' | 'rejected'
      })) as VerificationRequest[];

      const typedReports = (reportsData || []).map(r => ({
        ...r,
        status: r.status as 'pending' | 'resolved' | 'dismissed'
      })) as Report[];

      setVerificationRequests(typedVerifications);
      setReports(typedReports);
      
      setStats({
        totalUsers: totalUsers || 0,
        pendingReports: typedReports.filter(r => r.status === 'pending').length,
        pendingVerifications: typedVerifications.filter(v => v.status === 'pending').length,
        resolvedToday: 0 // You can calculate this based on updated_at if needed
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
    try {
      const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';
      
      const { error } = await supabase
        .from('user_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) throw error;

      // Update local state
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus as 'resolved' | 'dismissed' }
          : report
      ));

      toast({
        title: "Report Updated",
        description: `Report has been ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  const handleVerificationAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      // Update verification request
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select('user_id')
        .single();

      if (verificationError) throw verificationError;

      // Update user's id_verified status
      if (verificationData) {
        const userStatus = action === 'approve' ? 'verified' : 'rejected';
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ id_verified: userStatus })
          .eq('id', verificationData.user_id);

        if (profileError) throw profileError;
      }

      // Update local state
      setVerificationRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: newStatus as 'approved' | 'rejected' }
          : request
      ));

      toast({
        title: "Verification Updated",
        description: `Verification has been ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update verification",
        variant: "destructive"
      });
    }
  };

  const getDocumentUrl = (documentPath: string) => {
    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(documentPath);
    return data.publicUrl;
  };

  if (loading) {
    return <div className="p-4">Loading admin dashboard...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Stats Overview */}
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

      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verifications">ID Verifications</TabsTrigger>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ID Verification Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No verification requests</p>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                request.status === 'pending' ? 'secondary' :
                                request.status === 'approved' ? 'default' : 'destructive'
                              }>
                                {request.status}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                User: {request.profiles?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Email: {request.profiles?.email || 'Unknown'}
                              </p>
                              <p className="text-sm font-medium">
                                Document Type: {request.document_type}
                              </p>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => window.open(getDocumentUrl(request.document_url), '_blank')}
                              >
                                View Document
                              </Button>
                            </div>
                          </div>
                          
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerificationAction(request.id, 'reject')}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleVerificationAction(request.id, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reports to review</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                report.status === 'pending' ? 'destructive' :
                                report.status === 'resolved' ? 'default' : 'secondary'
                              }>
                                {report.status}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-600">
                                Reason: {report.reason}
                              </p>
                              <p className="text-sm">{report.description}</p>
                            </div>
                          </div>
                          
                          {report.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReportAction(report.id, 'dismiss')}
                              >
                                <X className="h-4 w-4" />
                                Dismiss
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'resolve')}
                              >
                                <Check className="h-4 w-4" />
                                Resolve
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
