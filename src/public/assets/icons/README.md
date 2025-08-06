# Icone SVG Personalizzate

Questa cartella contiene tutte le icone SVG personalizzate per il sito "I Malati dello Sport".

## Struttura delle Icone

### Icone di Interazione
- `like.svg` - Icona per il like
- `comment.svg` - Icona per i commenti
- `share.svg` - Icona per la condivisione
- `bookmark.svg` - Icona per il salvataggio
- `clock.svg` - Icona per il tempo di lettura
- `user.svg` - Icona per l'utente

### Icone per gli Sport
- `football.svg` - Icona per il calcio
- `tennis.svg` - Icona per il tennis
- `f1.svg` - Icona per la Formula 1
- `nfl.svg` - Icona per l'NFL
- `basketball.svg` - Icona per il basket

### Icone di Navigazione
- `home.svg` - Icona per la home
- `search.svg` - Icona per la ricerca
- `menu.svg` - Icona per il menu
- `close.svg` - Icona per chiudere

### Icone di Stato
- `trending.svg` - Icona per trending
- `fire.svg` - Icona per hot/trending
- `star.svg` - Icona per featured
- `notification.svg` - Icona per notifiche

## Specifiche Tecniche

- **Formato**: SVG
- **Dimensioni**: 24x24px (standard)
- **Colori**: Utilizzare `currentColor` per ereditare il colore del testo
- **Stile**: Lineare, minimalista, coerente con il design system

## Utilizzo

Le icone vengono caricate dinamicamente tramite il componente `Icon.tsx`:

```tsx
<Icon name="like" className="w-4 h-4" />
``` 