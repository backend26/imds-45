// Test data for sport-specific pages
export const mockArticles = [
  // Calcio
  {
    id: "1",
    title: "Juventus vince il Derby d'Italia contro l'Inter",
    excerpt: "Una partita spettacolare allo Stadium con la Juventus che batte l'Inter 2-1 grazie ai gol di Vlahović e Chiesa. Decisivo l'intervento del portiere Szczesny nel finale.",
    imageUrl: "/assets/images/derby-inter-milan.jpg",
    category: "calcio",
    publishedAt: "2024-08-21",
    timeAgo: "2 ore fa",
    author: "Marco Rossi",
    readTime: "3 min",
    likes: 245,
    comments: 89,
    views: 1250,
    featured: true
  },
  {
    id: "2",
    title: "Mercato Juventus: ufficiale l'arrivo di Koopmeiners",
    excerpt: "La Juventus chiude per il centrocampista olandese dell'Atalanta. Contratto quinquennale per il giocatore che indosserà la maglia numero 8.",
    imageUrl: "/assets/images/juventus-mercato.jpg",
    category: "calcio",
    publishedAt: "2024-08-20",
    timeAgo: "1 giorno fa",
    author: "Luca Bianchi",
    readTime: "2 min",
    likes: 156,
    comments: 45,
    views: 890
  },
  {
    id: "3",
    title: "Milan-Napoli: big match di Serie A nel weekend",
    excerpt: "Il Milan di Pioli ospita il Napoli di Spalletti in quello che si preannuncia come uno dei match più interessanti della giornata di campionato.",
    imageUrl: "/assets/images/default-banner.jpg",
    category: "calcio",
    publishedAt: "2024-08-19",
    timeAgo: "2 giorni fa",
    author: "Andrea Verdi",
    readTime: "4 min",
    likes: 198,
    comments: 67,
    views: 1100
  },

  // Tennis
  {
    id: "4",
    title: "Sinner trionfa agli US Open: primo italiano nella storia",
    excerpt: "Jannik Sinner scrive la storia del tennis italiano vincendo gli US Open. L'altoatesino batte Djokovic in una finale epica durata 4 set.",
    imageUrl: "/assets/images/hero-sinner-usopen.jpg",
    category: "tennis",
    publishedAt: "2024-08-21",
    timeAgo: "3 ore fa",
    author: "Giulia Neri",
    readTime: "5 min",
    likes: 892,
    comments: 234,
    views: 3450,
    featured: true
  },
  {
    id: "5",
    title: "Wimbledon 2024: Djokovic in semifinale",
    excerpt: "Novak Djokovic conquista la semifinale di Wimbledon battendo in quattro set il francese Humbert. Ora sfiderà Alcaraz per un posto in finale.",
    imageUrl: "/assets/images/default-banner.jpg",
    category: "tennis",
    publishedAt: "2024-08-18",
    timeAgo: "3 giorni fa",
    author: "Roberto Blu",
    readTime: "3 min",
    likes: 367,
    comments: 89,
    views: 1560
  },

  // F1
  {
    id: "6",
    title: "Verstappen domina a Monza: Red Bull inarrestabile",
    excerpt: "Max Verstappen vince il GP d'Italia a Monza davanti al pubblico di casa Ferrari. L'olandese consolida la leadership nel mondiale piloti.",
    imageUrl: "/assets/images/hero-verstappen-monza.jpg",
    category: "f1",
    publishedAt: "2024-08-20",
    timeAgo: "1 giorno fa",
    author: "Francesco Gialli",
    readTime: "4 min",
    likes: 445,
    comments: 156,
    views: 2100,
    featured: true
  },
  {
    id: "7",
    title: "Leclerc e la Ferrari: sogno mondiale ancora vivo",
    excerpt: "Charles Leclerc non si arrende nella lotta per il mondiale. Il pilota monegasco punta tutto sui prossimi GP per recuperare terreno su Verstappen.",
    imageUrl: "/assets/images/leclerc-ferrari.jpg",
    category: "f1",
    publishedAt: "2024-08-19",
    timeAgo: "2 giorni fa",
    author: "Marco Viola",
    readTime: "3 min",
    likes: 278,
    comments: 92,
    views: 1340
  },

  // Basket
  {
    id: "8",
    title: "Lakers vs Warriors: il classico NBA è sempre spettacolo",
    excerpt: "La sfida tra Lakers e Warriors regala ancora una volta emozioni forti. LeBron James e Stephen Curry si sfidano in una partita decisa agli overtime.",
    imageUrl: "/assets/images/lakers-warriors.jpg",
    category: "basket",
    publishedAt: "2024-08-21",
    timeAgo: "4 ore fa",
    author: "Michael Arancio",
    readTime: "3 min",
    likes: 334,
    comments: 78,
    views: 1890,
    featured: true
  },
  {
    id: "9",
    title: "Draft NBA 2024: i migliori prospetti europei",
    excerpt: "Analisi dei giovani talenti europei che potrebbero fare la differenza nel prossimo draft NBA. Focus sui giocatori italiani più promettenti.",
    imageUrl: "/assets/images/default-banner.jpg",
    category: "basket",
    publishedAt: "2024-08-17",
    timeAgo: "4 giorni fa",
    author: "Davide Rosa",
    readTime: "5 min",
    likes: 189,
    comments: 43,
    views: 876
  },

  // NFL
  {
    id: "10",
    title: "Chiefs vincono il Super Bowl: dinastia confermata",
    excerpt: "I Kansas City Chiefs conquistano il loro terzo Super Bowl in cinque anni. Patrick Mahomes MVP con una prestazione straordinaria nella finale.",
    imageUrl: "/assets/images/chiefs-superbowl.jpg",
    category: "nfl",
    publishedAt: "2024-08-15",
    timeAgo: "6 giorni fa",
    author: "Tom Verde",
    readTime: "6 min",
    likes: 567,
    comments: 145,
    views: 2890,
    featured: true
  },
  {
    id: "11",
    title: "Trade deadline NFL: le mosse più importanti",
    excerpt: "Analisi delle cessioni e acquisizioni più significative prima della trade deadline NFL. Focus sui giocatori che cambieranno squadra.",
    imageUrl: "/assets/images/default-banner.jpg",
    category: "nfl",
    publishedAt: "2024-08-14",
    timeAgo: "1 settimana fa",
    author: "Chris Azzurro",
    readTime: "4 min",
    likes: 223,
    comments: 67,
    views: 1245
  }
];

export const heroArticles = mockArticles.filter(article => article.featured);