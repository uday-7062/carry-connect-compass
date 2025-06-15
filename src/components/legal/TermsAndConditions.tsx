
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export const TermsAndConditions = () => {
  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <div className="space-y-6 p-6 text-sm">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">CarryConnect Terms & Conditions</h1>
          <p className="text-gray-600">Effective Date: June 15, 2025</p>
        </div>

        <p className="text-gray-700 leading-relaxed">
          Welcome to CarryConnect, a platform that connects travelers with people who need to send items between cities. 
          By using our app or services, you agree to the following Terms & Conditions. Please read them carefully.
        </p>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">1. Role of CarryConnect</h2>
          <p className="text-gray-700 leading-relaxed">
            CarryConnect acts solely as a technology platform to facilitate connections between two user groups:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Travelers who offer unused luggage space</li>
            <li>Senders who wish to transport items via these travelers</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            <strong>Important:</strong> CarryConnect does not own, inspect, handle, or guarantee any item exchanged through the platform, 
            nor does it participate in the transaction or delivery itself. We are purely a technology intermediary.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">2. User Responsibilities</h2>
          
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">2.1 For Travelers:</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>You are solely responsible for verifying the contents of any package you agree to carry</li>
              <li>You must ensure that you are not carrying any prohibited, illegal, or unreported items that may violate customs or transportation laws</li>
              <li>You agree to comply with all airline, airport, and country-specific security regulations</li>
              <li>You must declare items to customs authorities when required by law</li>
              <li>You are responsible for understanding weight and size restrictions of your chosen airline</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">2.2 For Senders:</h3>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>You are responsible for ensuring that all items you send are legal, safe, and accurately disclosed</li>
              <li>You agree that you are fully liable for the contents of your package, even if another party is transporting it</li>
              <li>You understand that misrepresentation or illegal items may result in legal action against you</li>
              <li>You must provide accurate descriptions, values, and documentation for all items</li>
              <li>You are responsible for proper packaging to prevent damage during transport</li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">3. Airport & Customs Issues Disclaimer</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Critical Disclaimer:</p>
            <p className="text-red-700 leading-relaxed">
              If a traveler is stopped or questioned by any airport authority, customs officer, or government agency, 
              CarryConnect bears <strong>no liability whatsoever</strong>.
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            All agreements between travelers and senders are independent and voluntary, and CarryConnect shall not be held 
            responsible or liable for any legal, criminal, or administrative issues arising due to transported items.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">4. Verification & Trust Signals</h2>
          <p className="text-gray-700 leading-relaxed">
            CarryConnect provides tools to help build trust (ID verification, document uploads, user ratings, etc.) but:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>We do not guarantee the authenticity of documents or identity claims</li>
            <li>Verification badges indicate document submission, not authenticity verification</li>
            <li>Users are advised to exercise their own judgment when accepting or sending items</li>
            <li>Meet in public places and follow safety guidelines for all exchanges</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">5. Payments & Financial Terms</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Payments are held in escrow and released only after delivery confirmation</li>
            <li>CarryConnect charges a platform fee per transaction (clearly displayed before payment)</li>
            <li>Disputes regarding items, damage, or loss must be resolved between the involved users</li>
            <li>Refunds are processed according to our refund policy (available separately)</li>
            <li>All payments are processed through secure third-party payment processors</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">6. Prohibited Items</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium mb-2">Strictly Prohibited:</p>
            <ul className="list-disc pl-6 space-y-1 text-yellow-700">
              <li>Weapons, drugs, or any illegal substances</li>
              <li>Hazardous materials (flammables, explosives, chemicals)</li>
              <li>Items banned by the airline or destination country</li>
              <li>Perishable goods without proper packaging and permits</li>
              <li>Currency above legal limits without declaration</li>
              <li>Counterfeit or pirated goods</li>
              <li>Items requiring special licenses or permits</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            <strong>Violation may lead to immediate account suspension, legal reporting, and potential criminal charges.</strong>
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">7. Platform Usage & Account Management</h2>
          <p className="text-gray-700 leading-relaxed">CarryConnect reserves the right to:</p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Suspend or terminate any account involved in suspicious or harmful activities</li>
            <li>Take action against users who are reported multiple times or violate these Terms</li>
            <li>Modify these Terms at any time with 30 days prior notice</li>
            <li>Cooperate with law enforcement agencies when required</li>
            <li>Remove listings that violate our policies</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">8. Insurance & Liability Coverage</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 leading-relaxed">
              While CarryConnect encourages users to obtain appropriate travel and item insurance, 
              we do not provide insurance coverage for transported items. Users are advised to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-blue-700">
              <li>Check with their existing insurance providers</li>
              <li>Consider purchasing additional coverage for valuable items</li>
              <li>Understand that airlines have limited liability for passenger baggage</li>
            </ul>
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">9. Limitation of Liability</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 font-medium mb-2">CarryConnect, its team, and affiliates are not liable for:</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Lost, damaged, delayed, or seized items</li>
              <li>Arrests, fines, or legal action caused by a user's item</li>
              <li>Misconduct, fraud, or disputes between users</li>
              <li>Financial losses resulting from platform usage</li>
              <li>Indirect, consequential, or punitive damages</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Your use of the platform is at your own risk, and you agree to indemnify CarryConnect against any claims arising from your use.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">10. Data Privacy & Security</h2>
          <p className="text-gray-700 leading-relaxed">
            Your privacy is important to us. Please review our Privacy Policy (available separately) which governs how we collect, 
            use, and protect your personal information. By using CarryConnect, you consent to our data practices as described in our Privacy Policy.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">11. Dispute Resolution</h2>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Users are encouraged to resolve disputes directly through our in-app messaging system</li>
            <li>CarryConnect may provide mediation assistance but is not obligated to resolve disputes</li>
            <li>For legal disputes, binding arbitration may be required as outlined in Section 12</li>
          </ul>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">12. Governing Law & Jurisdiction</h2>
          <p className="text-gray-700 leading-relaxed">
            These Terms are governed by the laws of the United States and the State of Delaware. 
            Any legal disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, 
            conducted in Delaware, United States.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">13. Updates to Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update these Terms from time to time. We will notify users of material changes via email and in-app notifications. 
            Continued use of the platform after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <Separator />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">14. Contact Information</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-2">For questions, concerns, or reports:</p>
            <ul className="space-y-1 text-blue-700">
              <li><strong>Email:</strong> legal@carryconnect.com</li>
              <li><strong>Support:</strong> support@carryconnect.com</li>
              <li><strong>Emergency Reports:</strong> emergency@carryconnect.com</li>
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
