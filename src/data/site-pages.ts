interface SitePage {
  path: string;
  name: string;
  description: string;
  accessLevel: 'public' | 'authenticated' | 'editor' | 'admin';
  category: 'main' | 'sports' | 'user' | 'admin' | 'legal' | 'editor';
}

export const sitePages: SitePage[] = [
  // Pagine Principali
  {
    path: '/',
    name: 'Homepage',
    description: 'Pagina principale con ultime notizie e contenuti in evidenza',
    accessLevel: 'public',
    category: 'main'
  },
  {
    path: '/search',
    name: 'Ricerca',
    description: 'Motore di ricerca per articoli e utenti',
    accessLevel: 'public',
    category: 'main'
  },
  
  // Pagine Sport
  {
    path: '/calcio',
    name: 'Calcio',
    description: 'Notizie e articoli sul calcio italiano e internazionale',
    accessLevel: 'public',
    category: 'sports'
  },
  {
    path: '/tennis',
    name: 'Tennis',
    description: 'Tornei, classifiche e notizie dal mondo del tennis',
    accessLevel: 'public',
    category: 'sports'
  },
  {
    path: '/f1',
    name: 'Formula 1',
    description: 'Gran Premi, piloti e team di Formula 1',
    accessLevel: 'public',
    category: 'sports'
  },
  {
    path: '/nfl',
    name: 'NFL',
    description: 'Football americano e Super Bowl',
    accessLevel: 'public',
    category: 'sports'
  },
  {
    path: '/basket',
    name: 'Basket',
    description: 'NBA, Serie A basket e campionati internazionali',
    accessLevel: 'public',
    category: 'sports'
  },
  
  // Autenticazione e Account
  {
    path: '/login',
    name: 'Accedi',
    description: 'Pagina di login per utenti registrati',
    accessLevel: 'public',
    category: 'user'
  },
  {
    path: '/registrati',
    name: 'Registrati',
    description: 'Creazione nuovo account utente',
    accessLevel: 'public',
    category: 'user'
  },
  {
    path: '/register',
    name: 'Register (Alias)',
    description: 'Alias inglese per la pagina di registrazione',
    accessLevel: 'public',
    category: 'user'
  },
  {
    path: '/email-confirmation',
    name: 'Conferma Email',
    description: 'Pagina di conferma dopo registrazione',
    accessLevel: 'public',
    category: 'user'
  },
  {
    path: '/reset-password',
    name: 'Reset Password',
    description: 'Reset della password dimenticata',
    accessLevel: 'public',
    category: 'user'
  },
  {
    path: '/account',
    name: 'Il Mio Account',
    description: 'Dashboard personale con impostazioni profilo, sicurezza e privacy',
    accessLevel: 'authenticated',
    category: 'user'
  },
  {
    path: '/@:username',
    name: 'Profilo Pubblico',
    description: 'Pagina profilo pubblico di un utente (es: @mario)',
    accessLevel: 'public',
    category: 'user'
  },
  
  // Editor e Contenuti
  {
    path: '/editor/new',
    name: 'Nuovo Articolo',
    description: 'Editor per creare nuovi articoli con WYSIWYG avanzato',
    accessLevel: 'editor',
    category: 'editor'
  },
  {
    path: '/editor/:postId/edit',
    name: 'Modifica Articolo',
    description: 'Editor per modificare articoli esistenti',
    accessLevel: 'editor',
    category: 'editor'
  },
  {
    path: '/post/:postId',
    name: 'Visualizza Articolo',
    description: 'Pagina di lettura di un singolo articolo',
    accessLevel: 'public',
    category: 'main'
  },
  
  // Area Amministrativa
  {
    path: '/admin/dashboard',
    name: 'Dashboard Admin',
    description: 'Pannello di controllo amministrativo con statistiche e gestione utenti',
    accessLevel: 'admin',
    category: 'admin'
  },
  {
    path: '/admin/guide',
    name: 'Guida Admin',
    description: 'Documentazione e guide per amministratori',
    accessLevel: 'admin',
    category: 'admin'
  },
  {
    path: '/admin/events',
    name: 'Gestione Eventi',
    description: 'Gestione eventi sportivi e calendario',
    accessLevel: 'editor',
    category: 'admin'
  },
  
  // Pagine Aziendali
  {
    path: '/chi-siamo',
    name: 'Chi Siamo',
    description: 'Informazioni sulla redazione e la missione del sito',
    accessLevel: 'public',
    category: 'main'
  },
  {
    path: '/contatti',
    name: 'Contatti',
    description: 'Form di contatto e informazioni di contatto',
    accessLevel: 'public',
    category: 'main'
  },
  
  // Pagine Legali
  {
    path: '/cookie-policy',
    name: 'Cookie Policy',
    description: 'Informativa sui cookie utilizzati dal sito',
    accessLevel: 'public',
    category: 'legal'
  },
  {
    path: '/privacy-policy',
    name: 'Privacy Policy',
    description: 'Informativa sulla privacy e trattamento dati personali',
    accessLevel: 'public',
    category: 'legal'
  },
  {
    path: '/terms-and-conditions',
    name: 'Termini e Condizioni',
    description: 'Termini di servizio e condizioni di utilizzo',
    accessLevel: 'public',
    category: 'legal'
  },
  
  // Pagina 404
  {
    path: '*',
    name: '404 - Not Found',
    description: 'Pagina di errore per URL non trovati',
    accessLevel: 'public',
    category: 'main'
  }
];

// Funzioni di utilità
export const getPagesByCategory = (category: SitePage['category']) => {
  return sitePages.filter(page => page.category === category);
};

export const getPagesByAccessLevel = (accessLevel: SitePage['accessLevel']) => {
  return sitePages.filter(page => page.accessLevel === accessLevel);
};

export const getPublicPages = () => {
  return sitePages.filter(page => page.accessLevel === 'public');
};

export const getProtectedPages = () => {
  return sitePages.filter(page => page.accessLevel !== 'public');
};

export const getAdminPages = () => {
  return sitePages.filter(page => page.accessLevel === 'admin');
};

export const getEditorPages = () => {
  return sitePages.filter(page => page.accessLevel === 'editor' || page.accessLevel === 'admin');
};

// Statistiche
export const getSiteStats = () => {
  const totalPages = sitePages.length;
  const publicPages = getPublicPages().length;
  const protectedPages = getProtectedPages().length;
  const adminPages = getAdminPages().length;
  const editorPages = getEditorPages().length;
  
  return {
    totalPages,
    publicPages,
    protectedPages,
    adminPages,
    editorPages,
    categories: {
      main: getPagesByCategory('main').length,
      sports: getPagesByCategory('sports').length,
      user: getPagesByCategory('user').length,
      admin: getPagesByCategory('admin').length,
      legal: getPagesByCategory('legal').length,
      editor: getPagesByCategory('editor').length
    }
  };
};