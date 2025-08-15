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
        class:
          'my-4 p-4 rounded-md border text-sm',
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
    // Determina lo stile in base al tipo di alert
    const typeClass = (() => {
      switch (HTMLAttributes.type) {
        case 'warning':
          return 'bg-yellow-50 border-l-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-l-yellow-600 dark:text-yellow-200';
        case 'error':
          return 'bg-red-50 border-l-red-400 text-red-800 dark:bg-red-900/20 dark:border-l-red-600 dark:text-red-200';
        case 'success':
          return 'bg-green-50 border-l-green-400 text-green-800 dark:bg-green-900/20 dark:border-l-green-600 dark:text-green-200';
        default:
          return 'bg-blue-50 border-l-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-l-blue-600 dark:text-blue-200';
      }
    })();

    return [
      'div',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'alert-box',
          'data-alert-type': HTMLAttributes.type || 'info',
          class: `${this.options.HTMLAttributes.class} ${typeClass}`,
          contenteditable: 'true',
          role: 'alert',
          'aria-live': 'polite',
        }
      ),
      0
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