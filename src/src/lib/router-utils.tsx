import { Link } from 'react-router-dom';

/**
 * Safe Link component - just a wrapper around Link for consistency
 */
export function SafeLink({ 
  to, 
  children, 
  className,
  ...props 
}: { 
  to: string; 
  children: React.ReactNode; 
  className?: string;
  [key: string]: any;
}) {
  return (
    <Link to={to} className={className} {...props}>
      {children}
    </Link>
  );
}