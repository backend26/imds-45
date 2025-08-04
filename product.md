# Product Requirements Document – I Malati dello Sport

## 1. Obiettivo
Una piattaforma di news sportive italiana, ricca di animazioni e 3D, pensata per un pubblico appassionato e tech-savvy.

## 2. Perché
- Differenziarsi dai competitor (ESPN, Sky Sports) con un'esperienza utente animata e interattiva.
- Fidelizzare gli "hardcore fans" grazie a contenuti dinamici e personalizzati.

## 3. Funzionalità Chiave
1. **Homepage con Hero 3D**: carosello full‑width con modello 3D interattivo.
2. **Sport Hub**: sezioni dedicate per Calcio, Tennis, F1, NFL, Basket.
3. **Filtri Avanzati**: ordinamento per data, popolarità, commenti e periodo temporale.
4. **Editor WYSIWYG & Markdown**: interfaccia drag‑and‑drop + modalità raw Markdown.
5. **Sistema Ruoli**: Registered User, Editor, Administrator con permessi differenziati.
6. **Live Match Center**: punteggi in tempo reale e commento testuale live.
7. **Notifiche**: alert personalizzati su commenti e nuovi articoli.
8. **Community Forum**: thread di discussione per ogni sport.
9. **Monetizzazione Ready**: supporto a future sottoscrizioni Premium.

## 4. Architettura Tecnica
- **Frontend**: React + Tailwind CSS + GSAP + Three.js (react-three-fiber).
- **Backend**: Node.js/Express + PostgreSQL.
- **Deploy**: Vercel (frontend) + Heroku/DigitalOcean (API).
- **CI/CD**: GitHub Actions per build, test e deploy automatici.

## 5. UX & Design System
- **Color Palette**: Rosso #ff3036, Grigio #3e3e3e, Bianco #f5f5f5.
- **Tipografia**: sans-serif moderna, gerarchia chiara (Headings, Body, Meta).
- **Motion**: micro-animazioni GSAP, transizioni fluide, hover fisico.
- **3D**: elementi Three.js per hero e visualizzazioni dati interattive.
- **Iconografia**: SVG personalizzate, nessun emoji.

## 6. Requisiti Non Funzionali
- **Performance**: CDN per asset + lazy loading immagini/3D.
- **Sicurezza**: SSL/TLS, CSRF, input sanitization, bcrypt per password.
- **Accessibilità**: contrasto WCAG AA, navigazione da tastiera.
- **Scalabilità**: architettura modulare, database normalizzato.

## 7. Metriche di Successo
- Tempo medio di sessione utenti > 4 minuti.
- Tasso di rimbalzo < 40%.
- Numero di articoli salvati per utente > 3.
- Feedback positivi sulla fluidità UI > 90%.

## 8. Roadmap Iniziale
1. Schema database + setup ambiente dev.
2. Layout base & componenti primari (header, footer, griglia articoli).
3. Sidebar + widget live, autori e social.
4. Catalogo filtri & sorting.
5. Proof‑of‑concept 3D in hero.
6. Editor e sistema ruoli.
7. Test cross‑device & deploy su staging.
8. Bugfix, ottimizzazioni e rilascio in produzione.
