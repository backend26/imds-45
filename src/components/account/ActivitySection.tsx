import { UserActivitySection } from './UserActivitySection';
import { useRoleCheck } from '@/hooks/use-role-check';

export const ActivitySection = () => {
  const { hasAccess: isJournalist } = useRoleCheck({ allowedRoles: ['editor', 'administrator'] });

  // Show different content based on user role
  if (isJournalist) {
    // Keep the existing journalist functionality 
    return <div>Editor/Admin Activity Dashboard - To be implemented</div>;
  }

  // For regular users, show the new user activity section
  return <UserActivitySection />;
};