// src/components/editor/extensions/CallToAction.ts
import { Node, mergeAttributes } from '@tiptap/core';

export interface CallToActionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callToAction: {
      setCallToAction: (options: { title?: string; content?: string; buttonText?: string }) => ReturnType;
    };
  }
}

export const CallToAction = Node.create<CallToActionOptions>({
  name: 'callToAction',
  group: 'block',
  content: 'block*',
  atom: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'cta-box bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30 rounded-lg p-6 my-6 text-center',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-cta]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        'data-cta': '', 
        contenteditable: 'true'
      }),
      0
    ];
  },

  addCommands() {
    return {
      setCallToAction:
        (options) =>
        ({ commands }) => {
          const attrs = {
            title: options.title?.trim() || '',
            buttonText: options.buttonText?.trim() || '',
          };
          return commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: 'text', text: options.content?.trim() || '' }],
          });
        },
    };
  },
});
