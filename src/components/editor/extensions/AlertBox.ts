import { Node, mergeAttributes } from '@tiptap/core';

export interface AlertBoxOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    alertBox: {
      setAlertBox: (options: { type: 'warning' | 'info' | 'success' | 'error'; content: string }) => ReturnType;
    };
  }
}

export const AlertBox = Node.create<AlertBoxOptions>({
  name: 'alertBox',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return { 'data-type': attributes.type };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-alert-box]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || 'info';
    const icons = {
      warning: '⚠️',
      info: 'ℹ️', 
      success: '✅',
      error: '❌'
    };
    
    const colors = {
      warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      info: 'bg-blue-100 border-blue-300 text-blue-800',
      success: 'bg-green-100 border-green-300 text-green-800',
      error: 'bg-red-100 border-red-300 text-red-800'
    };

    return [
      'div',
      mergeAttributes(
        {
          'data-alert-box': '',
          'data-type': type,
          class: `alert-box flex items-start gap-3 p-4 border-l-4 rounded-r-lg my-4 ${colors[type as keyof typeof colors]}`,
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      [
        'span',
        { class: 'text-xl flex-shrink-0 mt-0.5' },
        icons[type as keyof typeof icons]
      ],
      [
        'div',
        { class: 'flex-1' },
        0
      ]
    ];
  },

  addCommands() {
    return {
      setAlertBox:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type: options.type },
            content: [{ type: 'text', text: options.content }],
          });
        },
    };
  },
});