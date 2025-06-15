
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { Shield } from "lucide-react";

interface PrivacyModalProps {
  trigger?: React.ReactNode;
  triggerText?: string;
  variant?: "link" | "button";
}

export const PrivacyModal = ({ 
  trigger, 
  triggerText = "Privacy Policy",
  variant = "link" 
}: PrivacyModalProps) => {
  const defaultTrigger = variant === "link" ? (
    <button className="text-blue-600 hover:underline text-sm">
      {triggerText}
    </button>
  ) : (
    <Button variant="outline" size="sm">
      <Shield className="h-4 w-4 mr-2" />
      {triggerText}
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Privacy Policy
          </DialogTitle>
        </DialogHeader>
        <PrivacyPolicy />
      </DialogContent>
    </Dialog>
  );
};
