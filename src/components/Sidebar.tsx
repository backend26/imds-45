import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Clock, ExternalLink, TrendingUp, Users, Calendar, Twitter, Instagram } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [likedArticles] = useState([
    { id: 1, title: "Inter e Milan si sfidano nel Derby", time: "2 ore fa" },
    { id: 2, title: "Verstappen domina le prove libere", time: "4 ore fa" },
    { id: 3, title: "Sinner conquista il secondo turno", time: "6 ore fa" },
  ]);

  const socialFeed = [
    { 
      id: 1, 
      content: "Derby di Milano spettacolare! Che intensità in campo 🔥", 
      user: "@GazzettaOfficial", 
      platform: "twitter",
      time: "1h",
      avatar: "https://picsum.photos/40?random=1"
    },
    { 
      id: 2, 
      content: "Verstappen inarrestabile nelle prove libere! La Red Bull vola ⚡", 
      user: "@SkySportF1", 
      platform: "twitter",
      time: "2h",
      avatar: "https://picsum.photos/40?random=2"
    },
    { 
      id: 3, 
      content: "Sinner nella storia! Che talento il nostro campione 🎾🇮🇹", 
      user: "@SuperTennisTV", 
      platform: "instagram",
      time: "3h",
      avatar: "https://picsum.photos/40?random=3"
    },
  ];

  const trendingTopics = [
    { topic: "#DerbyMilano", count: "2.4K", color: "bg-red-500" },
    { topic: "#Verstappen", count: "1.8K", color: "bg-blue-500" },
    { topic: "#Sinner", count: "1.2K", color: "bg-green-500" },
    { topic: "#ChampionsLeague", count: "890", color: "bg-purple-500" },
  ];

  const popularAuthors = [
    { 
      id: 1, 
      name: "Marco Rossi", 
      title: "Giornalista sportivo", 
      avatar: "https://picsum.photos/40?random=4",
      specialty: "Calcio"
    },
    { 
      id: 2, 
      name: "Giulia Verdi", 
      title: "Inviata speciale", 
      avatar: "https://picsum.photos/40?random=5",
      specialty: "Tennis"
    },
    { 
      id: 3, 
      name: "Luigi Bianchi", 
      title: "Esperto di F1", 
      avatar: "https://picsum.photos/40?random=6",
      specialty: "Formula 1"
    },
  ];

  const upcomingEvents = [
    { id: 1, event: "Derby di Milano: Inter vs Milan", date: "15 Marzo", sport: "calcio" },
    { id: 2, event: "Finale ATP Master: Sinner vs Djokovic", date: "18 Marzo", sport: "tennis" },
    { id: 3, event: "GP Bahrain: Qualifiche", date: "20 Marzo", sport: "f1" },
    { id: 4, event: "Lakers vs Warriors", date: "22 Marzo", sport: "basket" },
  ];

  return (
    <aside className="w-72 space-y-6">
      {/* Trending Topics */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((item, index) => (
            <div key={index} className="flex justify-between items-center group cursor-pointer p-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${item.color}`} />
                <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.topic}</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{item.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Popular Authors - Redesigned */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            Autori Popolari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularAuthors.map((author) => (
            <div key={author.id} className="relative group cursor-pointer">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 group-hover:from-primary/10 group-hover:to-primary/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/20 group-hover:ring-primary/60 transition-all duration-300 group-hover:scale-110">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full animate-pulse group-hover:bg-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {author.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{author.title}</p>
                  <Badge variant="outline" className="text-xs mt-1 group-hover:border-primary/40 group-hover:text-primary transition-colors">{author.specialty}</Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events - Redesigned with Date Blocks */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            Prossimi Eventi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingEvents.map((event, index) => {
            const getSportIcon = (sport: string) => {
              switch (sport) {
                case 'calcio': return '⚽';
                case 'tennis': return '🎾';
                case 'f1': return '🏎️';
                case 'basket': return '🏀';
                default: return '🏆';
              }
            };

            const getSportName = (sport: string) => {
              switch (sport) {
                case 'calcio': return 'Serie A';
                case 'tennis': return 'ATP Tour';
                case 'f1': return 'Formula 1';
                case 'basket': return 'NBA';
                default: return 'Sport';
              }
            };

            const getDateParts = (dateStr: string) => {
              const date = new Date(2024, 2, parseInt(dateStr.split(' ')[0])); // Mock date for demo
              return {
                dayName: ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'][date.getDay()],
                dayNum: dateStr.split(' ')[0]
              };
            };

            const dateParts = getDateParts(event.date);

            return (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group cursor-pointer border border-transparent hover:border-primary/30">
                {/* Date Block */}
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/50 rounded-lg flex flex-col items-center justify-center text-xs font-bold border border-border/20">
                  <span className="text-primary text-[10px] leading-none">{dateParts.dayName}</span>
                  <span className="text-sm leading-none mt-0.5">{dateParts.dayNum}</span>
                </div>

                {/* Sport Icon */}
                <div className="text-lg">{getSportIcon(event.sport)}</div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                    {event.event}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">({getSportName(event.sport)})</p>
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-primary">20:45</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Social Feed Widget - Redesigned */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <ExternalLink className="h-4 w-4 mr-2 text-primary" />
            Social Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialFeed.map((post) => (
            <div key={post.id} className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-all duration-200 group">
              <div className="flex items-center space-x-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.avatar} alt={post.user} />
                  <AvatarFallback className="text-xs bg-primary/20">{post.user[1]}</AvatarFallback>
                </Avatar>
                <div className="flex items-center space-x-1">
                  {post.platform === 'twitter' ? (
                    <Twitter className="h-3 w-3 text-blue-500" />
                  ) : (
                    <Instagram className="h-3 w-3 text-pink-500" />
                  )}
                  <span className="text-xs font-medium">{post.user}</span>
                  <span className="text-xs text-muted-foreground">• {post.time}</span>
                </div>
              </div>
              <p className="text-sm group-hover:text-foreground transition-colors">{post.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* My Saved Articles */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bookmark className="h-4 w-4 mr-2 text-primary" />
            La Mia Lista
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {likedArticles.map((article) => (
            <div key={article.id} className="group cursor-pointer">
              <h4 className="text-sm font-medium mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {article.time}
              </div>
            </div>
          ))}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 hover:bg-primary hover:text-primary-foreground"
          >
            Vedi Tutti
          </Button>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="sidebar-card glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Resta Aggiornato</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Ricevi le ultime notizie sportive direttamente nella tua email.
          </p>
          <Button className="w-full bg-gradient-primary hover:bg-gradient-hover text-white">
            Iscriviti alla Newsletter
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};

export { Sidebar };