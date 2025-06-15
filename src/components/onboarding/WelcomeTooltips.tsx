
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, Lightbulb } from 'lucide-react';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  target?: string;
}

interface WelcomeTooltipsProps {
  userRole: 'traveler' | 'sender';
  onComplete: () => void;
}

export const WelcomeTooltips = ({ userRole, onComplete }: WelcomeTooltipsProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const travelerSteps: TooltipStep[] = [
    {
      id: 'welcome',
      title: 'Welcome, Traveler!',
      description: 'As a traveler, you can earn money by carrying items for others during your trips.'
    },
    {
      id: 'create',
      title: 'Create Travel Listings',
      description: 'Tap the "+" button to create a listing when you\'re planning a trip. Add your route, dates, and available space.'
    },
    {
      id: 'manage',
      title: 'Manage Requests',
      description: 'Check your messages to see delivery requests from senders and accept the ones that work for you.'
    },
    {
      id: 'verify',
      title: 'Get Verified',
      description: 'Upload ID verification in your profile to build trust and get more requests.'
    }
  ];

  const senderSteps: TooltipStep[] = [
    {
      id: 'welcome',
      title: 'Welcome, Sender!',
      description: 'Find travelers going to your destination and get your items delivered affordably.'
    },
    {
      id: 'search',
      title: 'Search for Travelers',
      description: 'Use the search tab to find travelers going from your location to your destination.'
    },
    {
      id: 'request',
      title: 'Send Requests',
      description: 'When you find a suitable traveler, send them a request with your item details and offered price.'
    },
    {
      id: 'track',
      title: 'Track Progress',
      description: 'Monitor your requests in the messages tab and coordinate with travelers.'
    }
  ];

  const steps = userRole === 'traveler' ? travelerSteps : senderSteps;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('tooltips_shown', 'true');
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-500">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="p-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-gray-600 mb-6">{step.description}</p>
          
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tutorial
            </Button>
            <Button onClick={nextStep} className="flex items-center">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
          
          <div className="flex space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
