
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TermsAndConditions } from "./TermsAndConditions";
import { FileText } from "lucide-react";

interface TermsModalProps {
  trigger?: React.ReactNode;
  triggerText?: string;
  variant?: "link" | "button";
}

export const TermsModal = ({ 
  trigger, 
  triggerText = "Terms & Conditions",
  variant = "link" 
}: TermsModalProps) => {
  const defaultTrigger = variant === "link" ? (
    <button className="text-blue-600 hover:underline text-sm">
      {triggerText}
    </button>
  ) : (
    <Button variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
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
            <FileText className="h-5 w-5 mr-2" />
            Terms & Conditions
          </DialogTitle>
        </DialogHeader>
        <TermsAndConditions />
      </DialogContent>
    </Dialog>
  );
};
