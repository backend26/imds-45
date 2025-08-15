import { Node, mergeAttributes } from '@tiptap/core';

export interface AlertBoxOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alertBox: {
      /**
       * Inserisce un blocco Alert Box
       */
      setAlertBox: (options: {
        type?: 'info' | 'warning' | 'error' | 'success';
        content?: string;
      }) => ReturnType;
    };
  }
}

export const AlertBox = Node.create<AlertBoxOptions>({
  name: 'alertBox',

  group: 'block',

  content: 'inline*',

  atom: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'my-4 p-4 rounded-lg border text-sm shadow-sm',
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

  renderHTML({ HTMLAttributes }) {
    const alertType = HTMLAttributes['data-alert-type'] || HTMLAttributes.type || 'info';
    
    // Determina icona e stile in base al tipo di alert con design migliorato
    const alertConfig = (() => {
      switch (alertType) {
        case 'warning':
          return {
            icon: '⚠️',
            bgClass: 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10',
            borderClass: 'border-l-4 border-amber-500 dark:border-amber-400',
            textClass: 'text-amber-900 dark:text-amber-200',
            iconClass: 'text-amber-600 dark:text-amber-400'
          };
        case 'error':
          return {
            icon: '❌',
            bgClass: 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10',
            borderClass: 'border-l-4 border-red-500 dark:border-red-400',
            textClass: 'text-red-900 dark:text-red-200',
            iconClass: 'text-red-600 dark:text-red-400'
          };
        case 'success':
          return {
            icon: '✅',
            bgClass: 'bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10',
            borderClass: 'border-l-4 border-green-500 dark:border-green-400',
            textClass: 'text-green-900 dark:text-green-200',
            iconClass: 'text-green-600 dark:text-green-400'
          };
        default:
          return {
            icon: 'ℹ️',
            bgClass: 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10',
            borderClass: 'border-l-4 border-blue-500 dark:border-blue-400',
            textClass: 'text-blue-900 dark:text-blue-200',
            iconClass: 'text-blue-600 dark:text-blue-400'
          };
      }
    })();

    return [
      'div',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'alert-box',
          'data-alert-type': alertType,
          class: `${this.options.HTMLAttributes.class} ${alertConfig.bgClass} ${alertConfig.borderClass} ${alertConfig.textClass}`,
          contenteditable: 'false',
          role: 'alert',
          'aria-live': 'polite',
        }
      ),
      [
        'div',
        { class: 'flex items-start gap-3' },
        [
          'span',
          { 
            class: `text-lg flex-shrink-0 mt-0.5 ${alertConfig.iconClass}`, 
            contenteditable: 'false'
          },
          alertConfig.icon
        ],
        [
          'div',
          { class: 'flex-1 font-medium', contenteditable: 'true' },
          0
        ]
      ]
    ];
  },

  addCommands() {
    return {
      setAlertBox:
        (options) =>
        ({ commands }) => {
          const attrs = {
            type: options.type || 'info',
            content: options.content?.trim() || '',
          };

          return commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'text', text: options.content?.trim() || 'Testo dell\'avviso...' }],
          });
        },
    };
  },
});