import { AlertCircle } from 'lucide-react';

interface ComponentPlaceholderProps {
  name: string;
  description?: string;
}

export const ComponentPlaceholder = ({ name, description }: ComponentPlaceholderProps) => {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p className="font-medium">{name} temporaneamente disabilitato</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
};