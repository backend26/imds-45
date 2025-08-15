import { Node, mergeAttributes } from '@tiptap/core';

export interface CallToActionOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callToAction: {
      setCallToAction: (options: { title: string; content: string; buttonText?: string }) => ReturnType;
    };
  }
}

export const CallToAction = Node.create<CallToActionOptions>({
  name: 'callToAction',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => {
          if (!attributes.title) {
            return {};
          }
          return { 'data-title': attributes.title };
        },
      },
      buttonText: {
        default: '',
        parseHTML: element => element.getAttribute('data-button-text'),
        renderHTML: attributes => {
          if (!attributes.buttonText) {
            return {};
          }
          return { 'data-button-text': attributes.buttonText };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-cta]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const title = node.attrs.title || '';
    const buttonText = node.attrs.buttonText || '';

    return [
      'div',
      mergeAttributes(
        {
          'data-cta': '',
          class: 'cta-box bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30 rounded-lg p-6 my-6 text-center',
        },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      [
        'div',
        { class: 'space-y-4' },
        title ? ['h3', { class: 'text-xl font-bold text-primary' }, title] : null,
        ['div', { class: 'text-muted-foreground' }, 0],
        buttonText ? [
          'button',
          {
            class: 'mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors',
            type: 'button'
          },
          buttonText
        ] : null
      ].filter(Boolean)
    ];
  },

  addCommands() {
    return {
      setCallToAction:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { title: options.title, buttonText: options.buttonText },
            content: [{ type: 'text', text: options.content }],
          });
        },
    };
  },
});