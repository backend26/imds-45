import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Facebook, Twitter, MessageCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareModalProps {
  postId: string;
  postTitle: string;
  postUrl?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  postId,
  postTitle,
  postUrl
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = postUrl || `${window.location.origin}/post/${postId}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'text-blue-400'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'text-green-600'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiato",
        description: "Il link è stato copiato negli appunti"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive"
      });
    }
  };

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
          title="Condividi articolo"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Condividi articolo</DialogTitle>
          <DialogDescription>
            Condividi questo articolo sui social media o copia il link
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Social Media Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3"
                onClick={() => handleSocialShare(social.url)}
              >
                <social.icon className={`h-5 w-5 ${social.color}`} />
                <span className="text-xs">{social.name}</span>
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Link diretto</label>
            <div className="flex items-center space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};