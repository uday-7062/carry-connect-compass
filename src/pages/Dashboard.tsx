
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MobileHeader } from '@/components/ui/mobile-header';
import { BottomNav } from '@/components/ui/bottom-nav';
import { HomeTab } from '@/components/dashboard/HomeTab';
import { SearchTab } from '@/components/dashboard/SearchTab';
import { CreateTab } from '@/components/dashboard/CreateTab';
import { MessagesTab } from '@/components/dashboard/MessagesTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const { profile } = useAuth();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'home': return 'CarryConnect';
      case 'search': return 'Find Matches';
      case 'create': return 'Create Listing';
      case 'messages': return 'Messages';
      case 'profile': return 'Profile';
      default: return 'CarryConnect';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'search': return <SearchTab />;
      case 'create': return <CreateTab />;
      case 'messages': return <MessagesTab />;
      case 'profile': return <ProfileTab />;
      default: return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader 
        title={getTabTitle()}
        showProfile={activeTab !== 'profile'}
        onProfile={() => setActiveTab('profile')}
      />
      
      <main className="pb-20 pt-4">
        {renderContent()}
      </main>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
}
