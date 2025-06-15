
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ReportUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  onSuccess?: () => void;
}

const REASONS = [
  "Spam or Scam",
  "Harassment or Violence",
  "Inappropriate Content",
  "Fake Profile",
  "Other"
];

export function ReportUserDialog({
  open,
  onOpenChange,
  reportedUserId,
  reportedUserName,
  reporterId,
  onSuccess,
}: ReportUserDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast({
        title: "Please select a reason.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("user_reports").insert({
        reported_user_id: reportedUserId,
        reporter_id: reporterId,
        reason,
        description,
      });
      if (error) throw error;
      toast({
        title: "Report submitted",
        description: `Thank you for helping keep CarryConnect safe.`,
      });
      setReason("");
      setDescription("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to submit report:", err);
      toast({ title: "Error", description: "Could not submit report", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!loading) {
      setReason("");
      setDescription("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {reportedUserName}</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting and, if you wish, add more details. Reports are confidential.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reason<span className="text-red-500"> *</span></label>
            <select
              className="w-full border rounded px-2 py-2 text-sm bg-white"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            >
              <option value="" disabled>Select a reason</option>
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details to help us review this..."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={handleDialogClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !reason} className="ml-2">
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
