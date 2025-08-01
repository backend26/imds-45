
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, TrendingUp, Calendar, Users, Twitter, Instagram } from "lucide-react";

const Sidebar = () => {
  const [likedArticles] = useState([
    { id: 1, title: "Inter e Milan si sfidano nel Derby", time: "2 ore fa" },
    { id: 2, title: "Verstappen domina le prove libere", time: "4 ore fa" },
    { id: 3, title: "Sinner conquista il secondo turno", time: "6 ore fa" },
  ]);

  const popularAuthors = [
    {
      id: 1,
      name: "Marco Verratti",
      role: "Corrispondente Calcio",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      articles: 247,
      followers: "12.5K"
    },
    {
      id: 2,
      name: "Sofia Martinelli",
      role: "Esperta Tennis",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b693?w=100&h=100&fit=crop&crop=face",
      articles: 189,
      followers: "8.9K"
    },
    {
      id: 3,
      name: "Luca Torretti",
      role: "Analista F1",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      articles: 156,
      followers: "15.2K"
    }
  ];

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
    { topic: "#DerbyMilano", count: "2.4K", trend: "+15%" },
    { topic: "#Verstappen", count: "1.8K", trend: "+8%" },
    { topic: "#Sinner", count: "1.2K", trend: "+12%" },
    { topic: "#ChampionsLeague", count: "987", trend: "+22%" },
    { topic: "#SerieA", count: "756", trend: "+5%" }
  ];

  const upcomingEvents = [
    {
      id: 1,
      event: "Inter vs Milan",
      date: "15 Gen",
      time: "20:45",
      league: "Serie A",
      logo: "⚽"
    },
    {
      id: 2,
      event: "GP Australia",
      date: "18 Gen",
      time: "06:00",
      league: "Formula 1",
      logo: "🏎️"
    },
    {
      id: 3,
      event: "Australian Open",
      date: "20 Gen",
      time: "09:00",
      league: "Tennis",
      logo: "🎾"
    }
  ];

  return (
    <aside className="w-80 space-y-6">
      {/* Autori Popolari */}
      <Card className="glass-effect border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            <span>Autori Popolari</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {popularAuthors.map((author) => (
            <div key={author.id} className="group cursor-pointer">
              <div className="flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-secondary/50 hover:scale-105">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {author.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{author.role}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-muted-foreground">{author.articles} articoli</span>
                    <span className="text-xs text-primary font-medium">{author.followers}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending Topics con Animazioni */}
      <Card className="glass-effect border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Trending Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.topic} className="group cursor-pointer">
              <div className="flex items-center justify-between p-2 rounded-lg transition-all duration-300 hover:bg-secondary/50">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="secondary" 
                    className="animate-pulse hover:animate-none transition-all duration-300 group-hover:bg-primary group-hover:text-white"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {topic.topic}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{topic.count}</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600/20 bg-green-50">
                  {topic.trend}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Prossimi Eventi Scorrevoli */}
      <Card className="glass-effect border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Prossimi Eventi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border/50 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/30 hover:scale-105">
                  <div className="text-2xl">{event.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {event.event}
                    </p>
                    <p className="text-xs text-muted-foreground">{event.league}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-primary">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Feed */}
      <Card className="glass-effect border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Twitter className="h-5 w-5 text-primary" />
            <span>Social Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialFeed.map((post) => (
            <div key={post.id} className="group cursor-pointer">
              <div className="flex space-x-3 p-3 rounded-lg transition-all duration-300 hover:bg-secondary/50">
                <Avatar className="h-8 w-8 transition-transform duration-300 group-hover:scale-110">
                  <AvatarImage src={post.avatar} alt={post.user} />
                  <AvatarFallback>{post.user[1]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-primary">{post.user}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{post.time}</span>
                    {post.platform === "twitter" ? (
                      <Twitter className="h-3 w-3 text-blue-500" />
                    ) : (
                      <Instagram className="h-3 w-3 text-pink-500" />
                    )}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed group-hover:text-primary transition-colors">
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
};

export { Sidebar };
