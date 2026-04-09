import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import SearchFilters from "@/components/SearchFilters";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const TenantDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const { approvedListings, payments, sendSms, getUserBookings } = useListings();
  const { toast } = useToast();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [maxPrice, setMaxPrice] = useState("");

  const myBookings = user ? getUserBookings(user.id) : [];
  const myPayments = user ? payments.filter((p) => p.userId === user.id) : [];

  const filtered = useMemo(() => {
    return approvedListings.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedLocation !== "All Locations" && p.area !== selectedLocation) return false;
      if (selectedType !== "All Types" && p.type !== selectedType) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [approvedListings, searchQuery, selectedLocation, selectedType, maxPrice]);

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleContactLandlord = (landlordName: string, landlordPhone: string, propertyTitle: string) => {
    sendSms(
      landlordPhone,
      `Hi ${landlordName}, I'm interested in "${propertyTitle}". Please contact me at ${user.email}. - ${user.name}`,
      "contact_landlord"
    );
    toast({ title: "SMS sent!", description: `Message sent to ${landlordName} via Gava Connect.` });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Tenant Dashboard</h1>
        <p className="mb-6 text-muted-foreground">Browse properties, book, pay, and track your house-hunting journey</p>

        {/* Quick Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{myBookings.length}</p>
            <p className="text-sm text-muted-foreground">My Bookings</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{myPayments.length}</p>
            <p className="text-sm text-muted-foreground">Payments Made</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-2xl font-bold">{approvedListings.length}</p>
            <p className="text-sm text-muted-foreground">Available Properties</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="gap-1"><Search className="h-3 w-3" /> Browse</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1"><History className="h-3 w-3" /> My Bookings</TabsTrigger>
            <TabsTrigger value="payments" className="gap-1"><MessageSquare className="h-3 w-3" /> Payments</TabsTrigger>
          </TabsList>

          {/* 1. Browse Properties with Search & Filter */}
          <TabsContent value="browse" className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "property" : "properties"} found
            </p>
            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <div key={p.id} className="flex flex-col">
                    <PropertyCard property={p} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 gap-1"
                      onClick={() => handleContactLandlord(p.landlordName, p.landlordPhone, p.title)}
                    >
                      <MessageSquare className="h-3 w-3" /> Contact via SMS
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">No properties match your filters.</div>
            )}
          </TabsContent>

          {/* 6. Booking History */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Booking History ({myBookings.length})</h2>
            {myBookings.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No bookings yet. Browse properties and book your next home!
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display font-semibold">{b.propertyTitle}</p>
                        <p className="text-sm text-muted-foreground">Booked on {new Date(b.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">"{b.message}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{b.status}</Badge>
                        <Badge className={b.paymentStatus === "paid" ? "bg-success/10 text-success border-0" : "bg-accent/10 text-accent border-0"}>
                          {b.paymentStatus === "paid" ? "💰 Paid" : "⏳ Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payment History */}
          <TabsContent value="payments" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Payment History ({myPayments.length})</h2>
            {myPayments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No payments yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myPayments.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex-1">
                      <p className="font-medium">{p.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">Tx: {p.transactionId}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="font-display text-lg font-bold text-success">KSh {p.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default TenantDashboard;
