
import { ArrowLeft, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showProfile?: boolean;
  onBack?: () => void;
  onMenu?: () => void;
  onProfile?: () => void;
}

export const MobileHeader = ({
  title,
  showBack = false,
  showMenu = false,
  showProfile = false,
  onBack,
  onMenu,
  onProfile
}: MobileHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenu}
            className="mr-2 p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <h1 className="text-lg font-semibold text-gray-900 truncate">
        {title}
      </h1>
      
      <div className="flex items-center">
        {showProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onProfile}
            className="p-2"
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  );
};
