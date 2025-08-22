import { PrivacySettings } from './PrivacySettings';

interface PrivacyTabProps {
  onError: (error: any) => void;
}

export const PrivacyTab = ({ onError }: PrivacyTabProps) => {
  return <PrivacySettings onError={onError} />;
};