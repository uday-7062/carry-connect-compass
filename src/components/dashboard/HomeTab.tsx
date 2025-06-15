import { useAuth } from '@/hooks/useAuth';
import { DemoContent } from '@/components/onboarding/DemoContent';

export const HomeTab = () => {
  const { profile } = useAuth();

  // For now, show demo content since we don't have real listings yet
  const showDemoContent = true; // This would be replaced with actual data check

  if (showDemoContent && profile?.role) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">
            {profile.role === 'traveler' ? 'Recent Delivery Requests' : 'Available Travelers'}
          </h2>
          <p className="text-gray-600 text-sm">
            {profile.role === 'traveler'
              ? 'People looking for travelers to carry their items'
              : 'Travelers with available luggage space'
            }
          </p>
        </div>

        <DemoContent userRole={profile.role as 'traveler' | 'sender'} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Welcome to CarryConnect</h2>
      <p className="text-gray-600">Your dashboard content will appear here.</p>
    </div>
  );
};
