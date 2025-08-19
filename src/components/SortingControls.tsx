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
  return (
    <div className="space-y-4 mb-6">
      {/* Compact Two-Dropdown Layout */}
      <div className="flex items-center gap-4">
        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Ordina per:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-auto min-w-[140px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Più Recenti</SelectItem>
              <SelectItem value="popular">Più Popolari</SelectItem>
              <SelectItem value="trending">Più Votate</SelectItem>
              <SelectItem value="comments">Più Commentate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Period Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Periodo:</span>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-auto min-w-[120px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sempre</SelectItem>
              <SelectItem value="today">Oggi</SelectItem>
              <SelectItem value="week">Settimana</SelectItem>
              <SelectItem value="month">Mese</SelectItem>
              <SelectItem value="year">Anno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};