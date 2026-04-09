import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Bed, Phone, User, Wifi, Zap, Droplets, Trash2, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { useListings } from "@/contexts/ListingsContext";

const PropertyDetail = () => {
  const { id } = useParams();
  const { approvedListings } = useListings();
  const property = approvedListings.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-32">
          <h1 className="mb-4 font-display text-2xl font-bold">Property Not Found</h1>
          <Button asChild variant="outline">
            <Link to="/listings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const utilities = [
    { icon: Droplets, label: "Water", value: property.utilities.water.available ? `KSh ${property.utilities.water.cost}/mo` : "Not included", available: property.utilities.water.available },
    { icon: Zap, label: "Electricity", value: property.utilities.electricity.type === "prepaid" ? "Prepaid (Tokens)" : `Monthly — KSh ${property.utilities.electricity.cost}/mo`, available: true },
    { icon: Wifi, label: "Wi-Fi", value: property.utilities.wifi.available ? `KSh ${property.utilities.wifi.cost}/mo` : "Not available", available: property.utilities.wifi.available },
    { icon: Trash2, label: "Garbage", value: `KSh ${property.utilities.garbage.cost}/mo`, available: true },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link to="/listings"><ArrowLeft className="h-4 w-4" /> Back to Listings</Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 overflow-hidden rounded-xl">
              <img src={property.image} alt={property.title} className="aspect-video w-full object-cover" />
            </div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className={property.available ? "bg-success text-success-foreground border-0" : "bg-destructive text-destructive-foreground border-0"}>
                {property.available ? "Available" : "Occupied"}
              </Badge>
              <Badge variant="secondary">{property.type.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
            </div>
            <h1 className="mb-2 font-display text-3xl font-bold">{property.title}</h1>
            <div className="mb-4 flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{property.location}</span>
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.rooms} {property.rooms === 1 ? "Room" : "Rooms"}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Posted {property.postedDate}</span>
            </div>
            <p className="mb-6 leading-relaxed text-muted-foreground">{property.description}</p>

            <div className="mb-6">
              <h2 className="mb-3 font-display text-xl font-semibold">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <Badge key={a} variant="outline" className="gap-1"><Check className="h-3 w-3 text-success" /> {a}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 font-display text-xl font-semibold">Utility Details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {utilities.map((u) => (
                  <div key={u.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${u.available ? "bg-success/10" : "bg-muted"}`}>
                      <u.icon className={`h-5 w-5 ${u.available ? "text-success" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.label}</p>
                      <p className="text-sm text-muted-foreground">{u.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-1 font-display text-3xl font-bold text-primary">KSh {property.price.toLocaleString()}</p>
              <p className="mb-6 text-sm text-muted-foreground">per month</p>

              <div className="mb-6 space-y-3 border-t border-border pt-4">
                <h3 className="font-display font-semibold">Landlord / Caretaker</h3>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{property.landlordName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{property.landlordPhone}</span>
                </div>
              </div>

              <BookingDialog propertyId={property.id} propertyTitle={property.title} available={property.available} price={property.price} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetail;
