
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plane, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FlightTicketParserProps {
  onDataExtracted: (data: {
    origin: string;
    destination: string;
    travel_date: string;
  }) => void;
}

export const FlightTicketParser = ({ onDataExtracted }: FlightTicketParserProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const parseTicket = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        
        // Call our edge function to parse the ticket
        const { data, error } = await supabase.functions.invoke('parse-flight-ticket', {
          body: { 
            image: base64Data.split(',')[1], // Remove data:image/jpeg;base64, prefix
            mimeType: file.type
          }
        });

        if (error) {
          console.error('Parse error:', error);
          toast({
            title: "Parsing Failed",
            description: "Could not extract information from the ticket. Please try again or enter manually.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (data?.origin && data?.destination && data?.travel_date) {
          onDataExtracted({
            origin: data.origin,
            destination: data.destination,
            travel_date: data.travel_date
          });
          
          toast({
            title: "Ticket Parsed Successfully!",
            description: "Flight information has been extracted and filled in the form.",
          });
        } else {
          toast({
            title: "Incomplete Information",
            description: "Could not extract all required information. Please verify and complete manually.",
            variant: "destructive"
          });
        }
        
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error parsing ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to parse ticket",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Upload Flight Ticket
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ticket-upload">Flight Ticket Image</Label>
          <Input
            id="ticket-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-gray-500">
            Upload your flight ticket to automatically extract travel details
          </p>
        </div>

        {preview && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <img 
              src={preview} 
              alt="Flight ticket preview" 
              className="max-w-full h-48 object-contain border rounded"
            />
          </div>
        )}

        <Button
          onClick={parseTicket}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Parsing Ticket...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Parse Flight Information
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
