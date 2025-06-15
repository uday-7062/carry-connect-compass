
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileHeader } from '@/components/ui/mobile-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { HomeTab } from '@/components/dashboard/HomeTab';
import { SearchTab } from '@/components/dashboard/SearchTab';
import { CreateTabWithPricing } from '@/components/dashboard/CreateTabWithPricing';
import { MessagesTab } from '@/components/dashboard/MessagesTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { PaymentsTab } from '@/components/dashboard/PaymentsTab';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { WelcomeTooltips } from '@/components/onboarding/WelcomeTooltips';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [showTooltips, setShowTooltips] = useState(false);
  const { profile } = useAuth();

  // Check if user needs onboarding - check for the field existence first
  const needsOnboarding = profile && ('onboarding_completed' in profile ? !profile.onboarding_completed : true);
  
  // Check if user should see tooltips
  useEffect(() => {
    if (profile && 'onboarding_completed' in profile && profile.onboarding_completed && !localStorage.getItem('tooltips_shown')) {
      setShowTooltips(true);
    }
  }, [profile]);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'CarryConnect';
      case 'search': return 'Find Matches';
      case 'create': return 'Create Listing';
      case 'messages': return 'Messages';
      case 'payments': return 'Payments';
      case 'profile': return 'Profile';
      default: return 'CarryConnect';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'search': return <SearchTab />;
      case 'create': return <CreateTabWithPricing />;
      case 'messages': return <MessagesTab />;
      case 'payments': return <PaymentsTab />;
      case 'profile': return <ProfileTab />;
      default: return <HomeTab />;
    }
  };

  // Show onboarding if user hasn't completed it
  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 select-none-mobile">
      <MobileHeader 
        title={getTabTitle()}
        showProfile={activeTab !== 'profile'}
        onProfile={() => setActiveTab('profile')}
      />
      
      <main className="pb-20 pt-2 px-1 safe-area-left safe-area-right min-h-[calc(100vh-136px)]">
        <div className="max-w-md mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {showTooltips && profile?.role && (
        <WelcomeTooltips 
          userRole={profile.role as 'traveler' | 'sender'}
          onComplete={() => setShowTooltips(false)}
        />
      )}
    </div>
  );

  function getTabTitle() {
    switch (activeTab) {
      case 'home': return 'CarryConnect';
      case 'search': return 'Find Matches';
      case 'create': return 'Create Listing';
      case 'messages': return 'Messages';
      case 'payments': return 'Payments';
      case 'profile': return 'Profile';
      default: return 'CarryConnect';
    }
  }

  function renderContent() {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'search': return <SearchTab />;
      case 'create': return <CreateTabWithPricing />;
      case 'messages': return <MessagesTab />;
      case 'payments': return <PaymentsTab />;
      case 'profile': return <ProfileTab />;
      default: return <HomeTab />;
    }
  }
}
