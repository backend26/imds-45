import React from 'react';
import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertBoxOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alertBox: {
      setAlertBox: (options: {
        type: 'info' | 'warning' | 'error' | 'success';
        content: string;
      }) => ReturnType;
    };
  }
}

interface AlertBoxComponentProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}

const AlertBoxComponent: React.FC<AlertBoxComponentProps> = ({ 
  node, 
  updateAttributes, 
  selected 
}) => {
  const { type = 'info', content = 'Testo dell\'avviso...' } = node.attrs;
  
  const alertConfig = (() => {
    switch (type) {
      case 'warning':
        return {
          Icon: AlertTriangle,
          bgClass: 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10',
          borderClass: 'border-l-4 border-amber-500 dark:border-amber-400',
          textClass: 'text-amber-900 dark:text-amber-200',
          iconClass: 'text-amber-600 dark:text-amber-400'
        };
      case 'error':
        return {
          Icon: XCircle,
          bgClass: 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10',
          borderClass: 'border-l-4 border-red-500 dark:border-red-400',
          textClass: 'text-red-900 dark:text-red-200',
          iconClass: 'text-red-600 dark:text-red-400'
        };
      case 'success':
        return {
          Icon: CheckCircle,
          bgClass: 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10',
          borderClass: 'border-l-4 border-green-500 dark:border-green-400',
          textClass: 'text-green-900 dark:text-green-200',
          iconClass: 'text-green-600 dark:text-green-400'
        };
      default:
        return {
          Icon: Info,
          bgClass: 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10',
          borderClass: 'border-l-4 border-blue-500 dark:border-blue-400',
          textClass: 'text-blue-900 dark:text-blue-200',
          iconClass: 'text-blue-600 dark:text-blue-400'
        };
    }
  })();

  return (
    <NodeViewWrapper className={cn(
      "my-4 p-4 rounded-lg border text-sm shadow-sm transition-all duration-200",
      alertConfig.bgClass,
      alertConfig.borderClass,
      alertConfig.textClass,
      selected && "ring-2 ring-primary ring-offset-2"
    )}>
      <div className="flex items-start gap-3">
        <alertConfig.Icon 
          className={cn("h-5 w-5 flex-shrink-0 mt-0.5", alertConfig.iconClass)} 
        />
        <div 
          className="flex-1 font-medium outline-none" 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            updateAttributes({ content: e.target.textContent });
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </NodeViewWrapper>
  );
};

export const AlertBox = Node.create<AlertBoxOptions>({
  name: 'alertBox',
  group: 'block',
  content: '',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-alert-type'),
        renderHTML: attributes => ({
          'data-alert-type': attributes.type,
        }),
      },
      content: {
        default: 'Testo dell\'avviso...',
        parseHTML: element => element.querySelector('.alert-content')?.textContent || '',
        renderHTML: attributes => ({
          'data-content': attributes.content,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="alert-box"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { type = 'info', content = 'Testo dell\'avviso...' } = node.attrs;
    
    const alertConfig = (() => {
      switch (type) {
        case 'warning':
          return { icon: '⚠️', classes: 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 text-amber-900' };
        case 'error':
          return { icon: '❌', classes: 'bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 text-red-900' };
        case 'success':
          return { icon: '✅', classes: 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-green-500 text-green-900' };
        default:
          return { icon: 'ℹ️', classes: 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500 text-blue-900' };
      }
    })();

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'alert-box',
        'data-alert-type': type,
        class: `my-4 p-4 rounded-lg border text-sm shadow-sm ${alertConfig.classes}`,
      }),
      [
        'div',
        { class: 'flex items-start gap-3' },
        ['span', { class: 'text-lg flex-shrink-0 mt-0.5' }, alertConfig.icon],
        ['div', { class: 'flex-1 font-medium alert-content' }, content]
      ]
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AlertBoxComponent);
  },

  addCommands() {
    return {
      setAlertBox:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              type: options.type || 'info',
              content: options.content || 'Testo dell\'avviso...',
            },
          });
        },
    };
  },
});