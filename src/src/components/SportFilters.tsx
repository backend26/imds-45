import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SportFiltersProps {
  selectedSport: string;
  onSportChange: (sport: string) => void;
}

const sports = [
  { name: "Tutti", value: "all" },
  { name: "Calcio", value: "calcio" },
  { name: "Tennis", value: "tennis" },
  { name: "F1", value: "f1" },
  { name: "NFL", value: "nfl" },
  { name: "Basket", value: "basket" },
];

export const SportFilters: React.FC<SportFiltersProps> = ({
  selectedSport,
  onSportChange,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-muted-foreground">Filtra per Sport:</span>
        <div className="flex flex-wrap gap-2">
          {sports.map((sport) => (
            <Badge
              key={sport.value}
              variant={selectedSport === sport.value ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm font-medium",
                selectedSport === sport.value
                  ? "bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:scale-105 hover:shadow-md"
              )}
              onClick={() => onSportChange(sport.value)}
            >
              {sport.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};