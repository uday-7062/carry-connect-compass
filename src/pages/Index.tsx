
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Luggage, Globe, Shield, Users, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const features = [
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with travelers worldwide for seamless delivery solutions"
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "All users are verified with ID and address proof for your safety"
    },
    {
      icon: Users,
      title: "Trusted Community",
      description: "Rate and review system ensures reliable and trustworthy connections"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frequent Traveler",
      content: "I've earned over $500 by sharing my luggage space. It's so easy!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Small Business Owner",
      content: "Perfect for sending samples to international clients quickly and affordably.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <Luggage className="h-12 w-12" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CarryConnect
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The future of global logistics powered by everyday travelers
            </p>
            
            <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
              Connect travelers with unused baggage space to people needing parcel delivery — locally or globally.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 px-8 py-3"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why CarryConnect?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of users who trust our platform for secure, affordable, and fast delivery solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to start earning or sending with CarryConnect
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* For Travelers */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Travelers</h3>
              <div className="space-y-4">
                {[
                  "Create your travel listing with route and dates",
                  "Set your price and available space",
                  "Get matched with senders along your route",
                  "Earn money while helping others"
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-lg">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* For Senders */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">For Senders</h3>
              <div className="space-y-4">
                {[
                  "Post your delivery request with details",
                  "Browse available travelers on your route",
                  "Connect and arrange secure handover",
                  "Track your item to destination"
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 mt-1 text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-lg">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join CarryConnect today and become part of the global logistics revolution.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3">
              Join CarryConnect Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
