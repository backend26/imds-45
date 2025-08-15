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
  content: 'inline*',
  atom: true,

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
    const title = HTMLAttributes.title || '';
    const buttonText = HTMLAttributes.buttonText || '';

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-cta': '' }),
      [
        'div',
        { class: 'space-y-4' },
        title ? ['h3', { class: 'text-xl font-bold text-primary' }, title] : null,
        ['div', { class: 'text-muted-foreground' }, 0],
        buttonText
          ? [
              'button',
              {
                class:
                  'mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors',
                type: 'button',
              },
              buttonText,
            ]
          : null,
      ].filter(Boolean),
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
