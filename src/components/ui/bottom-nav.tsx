
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 safe-area-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'flex flex-col items-center p-2 rounded-lg transition-colors min-h-[60px] min-w-[60px] flex-1',
              activeTab === id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
            )}
          >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
