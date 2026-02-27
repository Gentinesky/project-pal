import { Search, MapPin, Home, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations, propertyTypes } from "@/data/properties";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedLocation: string;
  onLocationChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  maxPrice: string;
  onMaxPriceChange: (val: string) => void;
}

const typeLabels: Record<string, string> = {
  "All Types": "All Types",
  apartment: "Apartment",
  bedsitter: "Bedsitter",
  "single-room": "Single Room",
  house: "House",
};

const SearchFilters = ({
  searchQuery, onSearchChange,
  selectedLocation, onLocationChange,
  selectedType, onTypeChange,
  maxPrice, onMaxPriceChange,
}: SearchFiltersProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger>
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger>
            <Home className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((t) => (
              <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="number"
            placeholder="Max price (KSh)"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
