import React from 'react';
import { AdvancedEditor } from '@/components/editor/AdvancedEditor';

export const EditorContentSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdvancedEditor />
    </div>
  );
};