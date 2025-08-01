import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Clock, Heart, MessageCircle, Filter, Calendar } from "lucide-react";

interface SortingControlsProps {
  selectedCategory: string;
  sortBy: string;
  period: string;
  categories: Array<{ name: string; count: number }>;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  onPeriodChange: (period: string) => void;
}

export const SortingControls: React.FC<SortingControlsProps> = ({
  selectedCategory,
  sortBy,
  period,
  categories,
  onCategoryChange,
  onSortChange,
  onPeriodChange,
}) => {
  const getSortIcon = (sort: string) => {
    switch (sort) {
      case 'recent': return Clock;
      case 'popular': return Heart;
      case 'trending': return TrendingUp;
      case 'comments': return MessageCircle;
      default: return Clock;
    }
  };

  const SortIcon = getSortIcon(sortBy);

  return (
    <div className="space-y-6 mb-8">
      {/* Category Filters */}
      <Card className="glass-effect sidebar-module">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Filtra per Sport</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedCategory === category.name
                    ? "bg-gradient-primary text-white shadow-lg hover:shadow-xl"
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                }`}
                onClick={() => onCategoryChange(category.name)}
              >
                {category.name}
                <span className="ml-1.5 text-xs opacity-75">
                  {category.count}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Sorting Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <SortIcon className="h-4 w-4 text-primary" />
            <span>Ordina per</span>
          </label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="glass-effect border-border/50 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Seleziona ordinamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Più Recenti</span>
                </div>
              </SelectItem>
              <SelectItem value="popular">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Più Popolari</span>
                </div>
              </SelectItem>
              <SelectItem value="trending">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Più Votate</span>
                </div>
              </SelectItem>
              <SelectItem value="comments">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Più Commentate</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Periodo</span>
          </label>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="glass-effect border-border/50 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Seleziona periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sempre</SelectItem>
              <SelectItem value="today">Oggi</SelectItem>
              <SelectItem value="week">Questa Settimana</SelectItem>
              <SelectItem value="month">Questo Mese</SelectItem>
              <SelectItem value="year">Quest'Anno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Filters Summary */}
      {(selectedCategory !== "Tutti" || sortBy !== "recent" || period !== "all") && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-muted-foreground">Filtri attivi:</span>
            {selectedCategory !== "Tutti" && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategory}
              </Badge>
            )}
            {sortBy !== "recent" && (
              <Badge variant="secondary" className="text-xs">
                {sortBy === 'popular' ? 'Popolari' : 
                 sortBy === 'trending' ? 'Votate' : 
                 sortBy === 'comments' ? 'Commentate' : 'Recenti'}
              </Badge>
            )}
            {period !== "all" && (
              <Badge variant="secondary" className="text-xs">
                {period === 'today' ? 'Oggi' : 
                 period === 'week' ? 'Settimana' : 
                 period === 'month' ? 'Mese' : 
                 period === 'year' ? 'Anno' : 'Sempre'}
              </Badge>
            )}
          </div>
          <button
            onClick={() => {
              onCategoryChange("Tutti");
              onSortChange("recent");
              onPeriodChange("all");
            }}
            className="text-xs text-primary hover:text-primary/80 font-medium"
          >
            Rimuovi tutti
          </button>
        </div>
      )}
    </div>
  );
};