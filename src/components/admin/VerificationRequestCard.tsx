
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

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

interface VerificationRequestCardProps {
  request: VerificationRequest;
  onAction: (requestId: string, action: 'approve' | 'reject') => void;
  getDocumentUrl: (documentPath: string) => string;
}

export const VerificationRequestCard = ({ request, onAction, getDocumentUrl }: VerificationRequestCardProps) => {
  return (
    <Card className="border-l-4 border-l-yellow-500">
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
                onClick={() => onAction(request.id, 'reject')}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => onAction(request.id, 'approve')}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
