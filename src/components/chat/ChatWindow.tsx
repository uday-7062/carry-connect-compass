import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentButton } from '@/components/PaymentButton';
import { RatingDialog } from '@/components/RatingDialog';
import { TrustBadges } from '@/components/TrustBadges';
import { ChatMessageImage } from './ChatMessageImage';
import { Flag } from "lucide-react";
import { ReportUserDialog } from "./ReportUserDialog";

type Profile = Database['public']['Tables']['profiles']['Row'];

type MessageType = 'text' | 'image' | 'file';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
}

interface ChatWindowProps {
  matchId: string;
  otherUser: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  onClose: () => void;
  listing: {
    id: string;
    price_usd: number;
  };
  senderId: string;
  matchStatus: string;
}

// Helper to map any string to MessageType (fallback to 'text')
const toMessageType = (type: any): MessageType => {
  if (type === 'image') return 'image';
  if (type === 'file') return 'file';
  return 'text';
};

export const ChatWindow = ({ matchId, otherUser, onClose, listing, senderId, matchStatus }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [checkingRatingStatus, setCheckingRatingStatus] = useState(true);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();

  const isSender = profile?.id === senderId;
  const showPaymentButton = isSender && matchStatus === 'pending';

  useEffect(() => {
    fetchMessages();
    checkIfRated();
    markMessagesAsRead();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const newMsg = payload.new as any;
          const mappedMsg: Message = {
            ...newMsg,
            message_type: toMessageType(newMsg.message_type),
          };
          setMessages(prev => [...prev, mappedMsg]);
          scrollToBottom();
          
          // Mark as read if not from current user
          if (newMsg.sender_id !== profile?.id) {
            markMessageAsRead(newMsg.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          const updatedMsg = payload.new as any;
          const mappedMsg: Message = {
            ...updatedMsg,
            message_type: toMessageType(updatedMsg.message_type),
          };
          setMessages(prev => 
            prev.map(msg => msg.id === mappedMsg.id ? mappedMsg : msg)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, profile?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      if (!otherUser.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUser.id)
          .maybeSingle();
        if (error) throw error;
        setOtherUserProfile(data);
      } catch (error) {
        console.error("Error fetching other user's profile:", error);
        toast({
          title: "Error",
          description: "Could not load user details.",
          variant: "destructive",
        });
      }
    };
    fetchOtherUserProfile();
  }, [otherUser.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      // Map message_type to correct union type
      setMessages(
        (data || []).map((msg: any) => ({
          ...msg,
          message_type: toMessageType(msg.message_type),
        }))
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const checkIfRated = async () => {
    if (!profile) return;
    setCheckingRatingStatus(true);
    try {
        const { data, error } = await supabase
            .from('ratings')
            .select('id')
            .eq('match_id', matchId)
            .eq('rater_id', profile.id)
            .limit(1);

        if (error) throw error;
        setHasRated(data && data.length > 0);
    } catch (error) {
        console.error("Error checking rating status:", error);
    } finally {
        setCheckingRatingStatus(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', profile?.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
    if (!content.trim() && !fileUrl) return;
    if (!profile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: profile.id,
          content: content.trim(),
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName,
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${matchId}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      await sendMessage(file.name, messageType, filePath, file.name);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .download(fileUrl);
      if (error) throw error;

      const blob = new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download failed",
        description: "Could not download the file.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>
                {otherUser.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherUser.full_name}</CardTitle>
              {otherUserProfile && (
                <div className="mt-1">
                  <TrustBadges profile={otherUserProfile} size="sm" />
                </div>
              )}
              {typing && <p className="text-xs text-gray-500">typing...</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Report user"
              onClick={() => setIsReportDialogOpen(true)}
            >
              <Flag className="h-5 w-5 text-red-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => {
            const isOwn = message.sender_id === profile?.id;
            
            const renderMessageContent = () => {
              if (message.message_type === 'image' && message.file_url) {
                return <ChatMessageImage fileUrl={message.file_url} />;
              }
              if (message.message_type === 'file' && message.file_url && message.file_name) {
                return (
                  <div 
                    className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-black hover:bg-opacity-10 rounded-md" 
                    onClick={() => downloadFile(message.file_url!, message.file_name!)}
                  >
                    <FileText className="h-6 w-6 flex-shrink-0" />
                    <span className="underline truncate" title={message.file_name}>{message.file_name}</span>
                    <Download className="h-4 w-4 flex-shrink-0" />
                  </div>
                );
              }
              return <p className="text-sm break-words">{message.content}</p>;
            };

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {renderMessageContent()}
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <span className="text-xs opacity-70">
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && (
                      <span className="text-xs opacity-70">
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {showPaymentButton && (
          <div className="border-t p-4 bg-gray-50">
            <PaymentButton
              listingId={listing.id}
              matchId={matchId}
              amount={listing.price_usd}
            />
          </div>
        )}
        
        {matchStatus === 'completed' && !checkingRatingStatus && (
          <div className="border-t p-4 bg-gray-50">
            {hasRated ? (
              <p className="text-sm text-center text-gray-500">You have already rated {otherUser.full_name}.</p>
            ) : (
              <Button className="w-full" onClick={() => setIsRatingDialogOpen(true)}>
                Rate {otherUser.full_name}
              </Button>
            )}
          </div>
        )}
        
        <div className="border-t p-4">
          <div className="flex space-x-2 items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,application/pdf,.doc,.docx,.txt" />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={uploading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={loading || uploading || !newMessage.trim()}
              size="icon"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardContent>
      <RatingDialog
        open={isRatingDialogOpen}
        onOpenChange={setIsRatingDialogOpen}
        matchId={matchId}
        ratedId={otherUser.id}
        ratedName={otherUser.full_name}
        onSuccess={() => {
          setHasRated(true);
        }}
      />
      <ReportUserDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        reportedUserId={otherUser.id}
        reporterId={profile?.id || ""}
        reportedUserName={otherUser.full_name}
      />
    </Card>
  );
};
