import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VenueWithTapa } from "@/types/database";

interface VenueCardProps {
  venue: VenueWithTapa;
  onClick: () => void;
}

const VenueCard = ({ venue, onClick }: VenueCardProps) => {
  const starTapa = venue.tapas[0];

  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-0 shadow-sm bg-card"
      onClick={onClick}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {starTapa && (
          <Badge 
            className="absolute bottom-3 left-3 bg-primary text-primary-foreground border-0 font-medium text-xs px-2.5 py-1"
          >
            {starTapa.name}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground leading-tight">
          {venue.name}
        </h3>
        {venue.address && (
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {venue.address}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VenueCard;
