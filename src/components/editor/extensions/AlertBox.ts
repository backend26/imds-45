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

  atom: true,

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
          return 'bg-yellow-50 border-yellow-400 text-yellow-800';
        case 'error':
          return 'bg-red-50 border-red-400 text-red-800';
        case 'success':
          return 'bg-green-50 border-green-400 text-green-800';
        default:
          return 'bg-blue-50 border-blue-400 text-blue-800';
      }
    })();

    return [
      'div',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          'data-type': 'alert-box',
          class: `${this.options.HTMLAttributes.class} ${typeClass}`,
        }
      ),
      [
        'p',
        {},
        HTMLAttributes.content || 'Testo dell’avviso...',
      ],
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
          });
        },
    };
  },
});
