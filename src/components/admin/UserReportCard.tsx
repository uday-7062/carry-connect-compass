
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Report {
  id: string;
  reported_user_id: string;
  reporter_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

interface UserReportCardProps {
  report: Report;
  onAction: (reportId: string, action: 'resolve' | 'dismiss') => void;
}

export const UserReportCard = ({ report, onAction }: UserReportCardProps) => {
  return (
    <Card className="border-l-4 border-l-red-500">
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
                onClick={() => onAction(report.id, 'dismiss')}
              >
                <X className="h-4 w-4" />
                Dismiss
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(report.id, 'resolve')}
              >
                <Check className="h-4 w-4" />
                Resolve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
