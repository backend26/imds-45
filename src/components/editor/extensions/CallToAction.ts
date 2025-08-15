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
  content: 'text*',
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
    const title = HTMLAttributes['data-cta-title'] || '';
    const content = HTMLAttributes['data-cta-content'] || 'Inserisci il testo del tuo call to action qui...';
    const buttonText = HTMLAttributes['data-cta-button'] || 'Scopri di più';
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 
        'data-cta': '',
        'data-cta-title': title,
        'data-cta-content': content,
        'data-cta-button': buttonText,
        contenteditable: 'false',
        role: 'region',
        'aria-label': 'Call to Action'
      }),
      [
        'div',
        { class: 'cta-content' },
        title ? ['h3', { class: 'text-xl font-bold mb-3 text-center' }, title] : null,
        ['p', { class: 'cta-text mb-6 text-center text-muted-foreground' }, content],
        ['div', { class: 'text-center' },
          ['button', { 
            class: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg',
            contenteditable: 'false'
          }, buttonText]
        ]
      ].filter(Boolean)
    ];
  },

  addCommands() {
    return {
      setCallToAction:
        (options) =>
        ({ commands }) => {
          const content = options.content?.trim() || 'Inserisci il testo del tuo call to action qui...';
          
          return commands.insertContent({
            type: this.name,
            attrs: {
              'data-cta-title': options.title?.trim() || '',
              'data-cta-content': content,
              'data-cta-button': options.buttonText?.trim() || 'Scopri di più',
            },
          });
        },
    };
  },
});
