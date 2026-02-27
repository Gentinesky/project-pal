import { Link } from "react-router-dom";
import { MapPin, Bed, Wifi, Zap, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/data/properties";

const PropertyCard = ({ property }: { property: Property }) => {
  const typeLabels: Record<string, string> = {
    apartment: "Apartment",
    bedsitter: "Bedsitter",
    "single-room": "Single Room",
    house: "House",
  };

  return (
    <Link to={`/property/${property.id}`} className="group block">
      <div className="card-elevated overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge
              className={`${
                property.available
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              } border-0`}
            >
              {property.available ? "Available" : "Occupied"}
            </Badge>
            <Badge variant="secondary" className="border-0 bg-background/80 backdrop-blur-sm">
              {typeLabels[property.type]}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.location}
          </div>
          <h3 className="mb-2 font-display text-lg font-semibold text-card-foreground line-clamp-1">
            {property.title}
          </h3>

          <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.rooms} {property.rooms === 1 ? "Room" : "Rooms"}
            </span>
            <span className="flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5" />
              {property.utilities.wifi.available ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <X className="h-3 w-3 text-destructive" />
              )}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              {property.utilities.electricity.type === "prepaid" ? "Prepaid" : "Monthly"}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <p className="font-display text-xl font-bold text-primary">
              KSh {property.price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
