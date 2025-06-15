
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, User, Plane, Star } from 'lucide-react';

interface TrustBadgesProps {
  profile: {
    email_verified?: boolean;
    id_verified?: string;
    rating?: number;
    total_ratings?: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

export const TrustBadges = ({ profile, size = 'sm' }: TrustBadgesProps) => {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  const badgeSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const trustScore = calculateTrustScore(profile);

  return (
    <div className="flex flex-wrap gap-1">
      {profile.email_verified && (
        <Badge variant="secondary" className={`${badgeSize} flex items-center gap-1`}>
          <Mail className={iconSize} />
          Email Verified
        </Badge>
      )}
      
      {profile.id_verified === 'verified' && (
        <Badge className={`${badgeSize} flex items-center gap-1 bg-green-600`}>
          <Shield className={iconSize} />
          ID Verified
        </Badge>
      )}
      
      {profile.rating && profile.rating > 0 && (
        <Badge variant="outline" className={`${badgeSize} flex items-center gap-1`}>
          <Star className={`${iconSize} text-yellow-500 fill-current`} />
          {profile.rating.toFixed(1)} ({profile.total_ratings})
        </Badge>
      )}
      
      <Badge 
        variant="outline" 
        className={`${badgeSize} ${getTrustScoreColor(trustScore)}`}
      >
        Trust Score: {trustScore}%
      </Badge>
    </div>
  );
};

const calculateTrustScore = (profile: any) => {
  let score = 0;
  
  if (profile.email_verified) score += 25;
  if (profile.id_verified === 'verified') score += 35;
  if (profile.rating && profile.rating >= 4) score += 25;
  if (profile.total_ratings && profile.total_ratings >= 5) score += 15;
  
  return Math.min(score, 100);
};

const getTrustScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 border-green-600';
  if (score >= 60) return 'text-yellow-600 border-yellow-600';
  return 'text-red-600 border-red-600';
};
