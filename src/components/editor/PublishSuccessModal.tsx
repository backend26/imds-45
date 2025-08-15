import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Eye, Plus, ArrowLeft } from 'lucide-react';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
  onCreateNew: () => void;
}

export const PublishSuccessModal: React.FC<PublishSuccessModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitle,
  onCreateNew,
}) => {
  const navigate = useNavigate();

  const handleViewPost = () => {
    navigate(`/post/${postId}`);
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  const handleBackToDashboard = () => {
    navigate('/');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary animate-scale-in" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Articolo Pubblicato con Successo!
          </DialogTitle>
          <DialogDescription className="text-center">
            "<span className="font-medium">{postTitle}</span>" è stato pubblicato e ora è visibile sul sito.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleViewPost}
            className="w-full bg-gradient-primary hover:bg-gradient-hover"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizza Articolo
          </Button>
          
          <Button 
            onClick={handleCreateNew}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crea Nuovo Articolo
          </Button>
          
          <Button 
            onClick={handleBackToDashboard}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Homepage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};