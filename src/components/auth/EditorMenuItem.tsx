import { Link } from 'react-router-dom';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Edit } from 'lucide-react';
import { useJournalistCheck } from '@/hooks/use-role-check';

export const EditorMenuItem = () => {
  const { hasAccess, isLoading } = useJournalistCheck();

  if (isLoading || !hasAccess) {
    return null;
  }

  return (
    <DropdownMenuItem asChild>
      <Link to="/editor" className="cursor-pointer">
        <Edit className="mr-2 h-4 w-4" />
        <span>Editor</span>
      </Link>
    </DropdownMenuItem>
  );
};