
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Package, Star, Plane, Train, Car } from 'lucide-react';

interface DemoContentProps {
  userRole: 'traveler' | 'sender';
}

export const DemoContent = ({ userRole }: DemoContentProps) => {
  const demoTravelListings = [
    {
      id: 'demo-1',
      traveler: 'Sarah Johnson',
      from: 'New York',
      to: 'London',
      date: '2025-06-20',
      price: '$25/kg',
      space: '15kg',
      transport: 'plane',
      rating: 4.9,
      verified: true
    },
    {
      id: 'demo-2',
      traveler: 'Mike Chen',
      from: 'Los Angeles',
      to: 'Tokyo',
      date: '2025-06-22',
      price: '$30/kg',
      space: '10kg',
      transport: 'plane',
      rating: 4.7,
      verified: true
    }
  ];

  const demoDeliveryRequests = [
    {
      id: 'demo-req-1',
      sender: 'Emma Wilson',
      item: 'Documents',
      from: 'San Francisco',
      to: 'Seattle',
      date: '2025-06-18',
      price: '$40',
      weight: '0.5kg',
      urgent: false
    },
    {
      id: 'demo-req-2',
      sender: 'David Brown',
      item: 'Electronics',
      from: 'Boston',
      to: 'Miami',
      date: '2025-06-25',
      price: '$75',
      weight: '2kg',
      urgent: true
    }
  ];

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'plane': return <Plane className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      default: return <Plane className="h-4 w-4" />;
    }
  };

  if (userRole === 'sender') {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-1">No travelers found yet</h3>
          <p className="text-sm text-blue-600">Here are some example travel listings to show you how it works:</p>
        </div>
        
        {demoTravelListings.map((listing) => (
          <Card key={listing.id} className="opacity-75">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {listing.traveler.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{listing.traveler}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {listing.rating}
                      {listing.verified && (
                        <Badge variant="outline" className="ml-2 text-xs">Verified</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {listing.price}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{listing.from} → {listing.to}</span>
                  {getTransportIcon(listing.transport)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span>{listing.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Available space: {listing.space}</span>
                </div>
              </div>
              
              <Button className="w-full" disabled>
                Request Delivery (Demo)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-800 mb-1">No delivery requests yet</h3>
        <p className="text-sm text-green-600">Here are some example requests to show you how it works:</p>
      </div>
      
      {demoDeliveryRequests.map((request) => (
        <Card key={request.id} className="opacity-75">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {request.sender.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium">{request.sender}</h4>
                  <p className="text-sm text-gray-600">{request.item}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-green-600 border-green-600 mb-1">
                  {request.price}
                </Badge>
                {request.urgent && (
                  <Badge variant="destructive" className="block text-xs">Urgent</Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{request.from} → {request.to}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span>{request.date}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 text-gray-400 mr-2" />
                <span>Weight: {request.weight}</span>
              </div>
            </div>
            
            <Button className="w-full" disabled>
              Accept Request (Demo)
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
