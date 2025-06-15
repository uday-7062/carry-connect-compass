
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plane, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

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
      // Use Tesseract.js to extract text from the image
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m) // Optional: log progress
      });

      console.log('Extracted text:', text);

      // Simple text parsing logic to extract flight information
      const extractedData = parseFlightText(text);

      if (extractedData.origin && extractedData.destination && extractedData.travel_date) {
        onDataExtracted(extractedData);
        
        toast({
          title: "Ticket Parsed Successfully!",
          description: "Flight information has been extracted and filled in the form.",
        });
      } else {
        toast({
          title: "Partial Information Extracted",
          description: "Some information was found. Please verify and complete manually.",
        });
        
        // Even if incomplete, pass what we found
        onDataExtracted(extractedData);
      }
      
    } catch (error: any) {
      console.error('Error parsing ticket:', error);
      toast({
        title: "Parsing Failed",
        description: "Could not extract information from the ticket. Please try a clearer image or enter manually.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const parseFlightText = (text: string): { origin: string; destination: string; travel_date: string } => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let origin = '';
    let destination = '';
    let travel_date = '';

    // Common airport code patterns (3 letters)
    const airportCodeRegex = /\b[A-Z]{3}\b/g;
    const dateRegex = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2})\b/g;
    
    // Extract airport codes
    const airportCodes = [];
    for (const line of lines) {
      const matches = line.match(airportCodeRegex);
      if (matches) {
        airportCodes.push(...matches);
      }
    }

    // Extract dates
    const dates = [];
    for (const line of lines) {
      const matches = line.match(dateRegex);
      if (matches) {
        dates.push(...matches);
      }
    }

    // Try to identify origin and destination
    if (airportCodes.length >= 2) {
      origin = airportCodes[0];
      destination = airportCodes[1];
    }

    // Convert first found date to YYYY-MM-DD format
    if (dates.length > 0) {
      try {
        const dateStr = dates[0];
        let date: Date;
        
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Assume MM/DD/YYYY or DD/MM/YYYY format
            if (parts[2].length === 4) {
              date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            } else {
              date = new Date(parseInt(`20${parts[2]}`), parseInt(parts[0]) - 1, parseInt(parts[1]));
            }
          } else {
            date = new Date(dateStr);
          }
        } else {
          date = new Date(dateStr);
        }
        
        if (!isNaN(date.getTime())) {
          travel_date = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.log('Date parsing failed:', e);
      }
    }

    // Try to find city names if airport codes not found
    if (!origin || !destination) {
      const cityKeywords = ['FROM', 'TO', 'DEPART', 'ARRIVE', 'DEPARTURE', 'ARRIVAL'];
      for (const line of lines) {
        const upperLine = line.toUpperCase();
        for (const keyword of cityKeywords) {
          if (upperLine.includes(keyword)) {
            const parts = line.split(/\s+/);
            const keywordIndex = parts.findIndex(part => part.toUpperCase().includes(keyword));
            if (keywordIndex >= 0 && keywordIndex < parts.length - 1) {
              const cityCandidate = parts[keywordIndex + 1];
              if (keyword.includes('FROM') || keyword.includes('DEPART')) {
                origin = origin || cityCandidate;
              } else if (keyword.includes('TO') || keyword.includes('ARRIVE')) {
                destination = destination || cityCandidate;
              }
            }
          }
        }
      }
    }

    return { origin, destination, travel_date };
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
            Upload your flight ticket image to automatically extract travel details
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

        {loading && (
          <p className="text-sm text-gray-500 text-center">
            Processing image... This may take a few moments.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
