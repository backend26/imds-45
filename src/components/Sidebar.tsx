import { useState } from "react";
import { RealTrendingWidget } from './sidebar/RealTrendingWidget';
import { EventsWidget } from "@/components/sidebar/EventsWidget";
import { RealPopularAuthorsWidget } from "@/components/sidebar/RealPopularAuthorsWidget";
import { Separator } from "@/components/ui/separator";

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


  const upcomingEvents = [
    { id: 1, event: "Derby di Milano: Inter vs Milan", date: "15 Marzo", sport: "calcio" },
    { id: 2, event: "Finale ATP Master: Sinner vs Djokovic", date: "18 Marzo", sport: "tennis" },
    { id: 3, event: "GP Bahrain: Qualifiche", date: "20 Marzo", sport: "f1" },
    { id: 4, event: "Lakers vs Warriors", date: "22 Marzo", sport: "basket" },
  ];

  return (
    <aside className="w-72 space-y-6">
      {/* Real Events Widget */}
      <EventsWidget />
      
      <Separator />

      {/* Real Trending Topics Widget */}
      <RealTrendingWidget />

      <Separator />

      {/* Real Popular Authors Widget */}
      <RealPopularAuthorsWidget />
    </aside>
  );
};

export { Sidebar };