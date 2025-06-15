
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationRequestCard } from './VerificationRequestCard';
import { UserReportCard } from './UserReportCard';

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

interface Report {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

interface AdminTabsProps {
  verificationRequests: VerificationRequest[];
  reports: Report[];
  onVerificationAction: (requestId: string, action: 'approve' | 'reject') => void;
  onReportAction: (reportId: string, action: 'resolve' | 'dismiss') => void;
  getDocumentUrl: (documentPath: string) => string;
}

export const AdminTabs = ({ 
  verificationRequests, 
  reports, 
  onVerificationAction, 
  onReportAction,
  getDocumentUrl 
}: AdminTabsProps) => {
  return (
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
                  <VerificationRequestCard
                    key={request.id}
                    request={request}
                    onAction={onVerificationAction}
                    getDocumentUrl={getDocumentUrl}
                  />
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
                  <UserReportCard
                    key={report.id}
                    report={report}
                    onAction={onReportAction}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
