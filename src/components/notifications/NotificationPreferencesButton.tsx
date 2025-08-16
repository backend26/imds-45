import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationPreferencesModal } from './NotificationPreferencesModal';

interface Props {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const NotificationPreferencesButton = ({ variant = "outline", size = "sm", className, children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {children || "Gestisci Preferenze"}
      </Button>
      
      <NotificationPreferencesModal 
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};