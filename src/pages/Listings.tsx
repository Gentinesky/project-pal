import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import { useListings } from "@/contexts/ListingsContext";

const Listings = () => {
  const { approvedListings, loading } = useListings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = useMemo(() => {
    return approvedListings.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedLocation !== "All Locations" && p.area !== selectedLocation) return false;
      if (selectedType !== "All Types" && p.type !== selectedType) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [approvedListings, searchQuery, selectedLocation, selectedType, maxPrice]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-display text-3xl font-bold">Browse Listings</h1>
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
        />
        <p className="mt-4 mb-4 text-sm text-muted-foreground">
          {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "property" : "properties"} found`}
        </p>
        {!loading && filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">No properties match your filters.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
