import { ReactNode } from 'react';
import { useLocationTracking } from '@/hooks/use-location-tracking';

interface LocationTrackingWrapperProps {
  children: ReactNode;
}

export const LocationTrackingWrapper = ({ children }: LocationTrackingWrapperProps) => {
  // Initialize location tracking hook
  useLocationTracking();
  
  return <>{children}</>;
};