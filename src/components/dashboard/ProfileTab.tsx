
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, LogOut, User, Mail, Phone, MapPin, Shield, Camera, Upload, FileText, Luggage, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const ProfileTab = () => {
  const { profile, signOut, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const { toast } = useToast();

  // Pre-fill form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) throw error;
      
      setEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or PDF file",
        variant: "destructive"
      });
      return;
    }

    setUploadingDoc(true);
    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      // Create verification request in database
      const { error: dbError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: profile.id,
          document_type: getDocumentType(file.type),
          document_url: uploadData.path,
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast({
        title: "Document Uploaded",
        description: "Your verification document has been submitted for review. We'll notify you once it's processed.",
      });

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const getDocumentType = (fileType: string) => {
    if (fileType === 'application/pdf') return 'PDF Document';
    return 'ID Document';
  };

  const getVerificationColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile?.full_name}</h2>
              <p className="text-gray-600">{profile?.email}</p>
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {profile?.role || 'Not set'}
                </Badge>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span>{profile?.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-gray-500 ml-1">
                    ({profile?.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      {profile?.role && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {profile.role === 'traveler' ? (
                <Luggage className="h-5 w-5 mr-2" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Your Role: {profile.role === 'traveler' ? 'Traveler' : 'Sender'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              {profile.role === 'traveler' 
                ? 'You can create travel listings and earn money by carrying items for others during your trips.'
                : 'You can find travelers and request them to carry your items to destinations around the world.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span>Email Verification</span>
            </div>
            <Badge className={profile?.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
              {profile?.email_verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>ID Verification</span>
            </div>
            <Badge className={getVerificationColor(profile?.id_verified)}>
              {profile?.id_verified || 'Pending'}
            </Badge>
          </div>

          <Separator />

          {/* Document Upload Section */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Upload ID Document
            </h4>
            <p className="text-sm text-gray-600">
              Upload your passport, driving license, or other government-issued ID for verification.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="document-upload" className="text-sm font-medium">
                Choose Document (JPEG, PNG, or PDF, max 5MB)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="document-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDoc}
                  className="flex-1"
                />
                <Button 
                  size="sm" 
                  disabled={uploadingDoc}
                  className="whitespace-nowrap"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {uploadingDoc ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Accepted Documents:</strong> Passport, Driver's License, National ID Card, or other government-issued photo ID
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
            >
              {editing ? (loading ? 'Saving...' : 'Save') : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={editing ? formData.full_name : profile?.full_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              disabled={!editing}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={editing ? formData.phone : profile?.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={!editing}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={editing ? formData.address : profile?.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              disabled={!editing}
              placeholder="Enter your address"
            />
          </div>

          {editing && (
            <Button 
              variant="outline" 
              onClick={() => {
                setEditing(false);
                setFormData({
                  full_name: profile?.full_name || '',
                  phone: profile?.phone || '',
                  address: profile?.address || ''
                });
              }}
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardContent className="p-4 space-y-2">
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/admin')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={signOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

