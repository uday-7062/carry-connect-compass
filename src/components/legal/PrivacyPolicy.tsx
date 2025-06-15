
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const PrivacyPolicy = () => {
  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <div className="space-y-6 p-6 text-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">CarryConnect Privacy Policy</h1>
          <p className="text-gray-600">Effective Date: June 15, 2025</p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          At CarryConnect, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
          and protect your personal information when you use our platform.
        </p>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">1.1 Personal Information:</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Full name, email address, and phone number</li>
              <li>Profile photo and address</li>
              <li>Government-issued ID for verification</li>
              <li>Payment information (processed securely by third parties)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">1.2 Usage Information:</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Device information and IP address</li>
              <li>App usage patterns and interactions</li>
              <li>Location data (when permitted)</li>
              <li>Communication between users (for safety and support)</li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>To provide and improve our platform services</li>
            <li>To verify user identity and build trust</li>
            <li>To facilitate connections between travelers and senders</li>
            <li>To process payments securely</li>
            <li>To provide customer support</li>
            <li>To comply with legal requirements</li>
            <li>To prevent fraud and ensure platform safety</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">3. Information Sharing</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">We share your information only in these situations:</p>
            <ul className="list-disc pl-6 space-y-1 text-blue-700">
              <li>With other users as necessary for platform functionality</li>
              <li>With service providers who help operate our platform</li>
              <li>When required by law or legal process</li>
              <li>To prevent fraud or ensure user safety</li>
              <li>With your explicit consent</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed mt-3">
            We never sell your personal information to third parties for marketing purposes.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We implement industry-standard security measures to protect your data, including encryption, 
            secure servers, and regular security audits. However, no method of transmission over the internet 
            is 100% secure.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">5. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Access and update your personal information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
            <li>Report privacy concerns to our team</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">6. Contact Us</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">Privacy Questions:</p>
            <ul className="space-y-1 text-green-700">
              <li><strong>Email:</strong> privacy@carryconnect.com</li>
              <li><strong>Data Protection Officer:</strong> dpo@carryconnect.com</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Last updated: June 15, 2025 | Version 1.0
          </p>
        </div>
      </div>
    </ScrollArea>
  );
};
