import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Clock, ExternalLink, TrendingUp, Users, Calendar, Twitter, Instagram } from "lucide-react";
import { Icon } from "./Icon";

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
    { topic: "#DerbyMilano", count: "2.4K" },
    { topic: "#Verstappen", count: "1.8K" },
    { topic: "#Sinner", count: "1.2K" },
    { topic: "#ChampionsLeague", count: "890" },
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
      <Card className="glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((item, index) => (
            <div key={index} className="flex justify-between items-center group cursor-pointer">
              <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.topic}</span>
              <Badge variant="secondary" className="text-xs">{item.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Popular Authors - Redesigned */}
      <Card className="glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="h-4 w-4 mr-2 text-primary" />
            Autori Popolari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularAuthors.map((author) => (
            <div key={author.id} className="flex items-center space-x-3 group cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  {author.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {author.name}
                </h4>
                <p className="text-xs text-muted-foreground">{author.title}</p>
                <Badge variant="outline" className="text-xs mt-1">{author.specialty}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events - New Module */}
      <Card className="glass-effect hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            Prossimi Eventi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="flex items-center space-x-3 group cursor-pointer p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon name={event.sport === 'calcio' ? 'fire' : event.sport === 'tennis' ? 'fire' : 'fire'} className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                  {event.event}
                </h4>
                <p className="text-xs text-muted-foreground">{event.date}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social Feed Widget - Redesigned */}
      <Card className="glass-effect hover-lift">
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
      <Card className="glass-effect hover-lift">
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
      <Card className="glass-effect hover-lift">
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