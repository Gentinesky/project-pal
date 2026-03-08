import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import type { Property } from "@/data/properties";

const LandlordDashboard = () => {
  const { user, isLoggedIn } = useAuth();
  const { pendingListings, submitListing } = useListings();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<Property["type"]>("apartment");
  const [price, setPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [wifi, setWifi] = useState(false);
  const [waterCost, setWaterCost] = useState("");
  const [electricityType, setElectricityType] = useState<"prepaid" | "monthly">("prepaid");
  const [garbageCost, setGarbageCost] = useState("");

  if (!isLoggedIn || user?.role !== "landlord") {
    return <Navigate to="/login" replace />;
  }

  const myPending = pendingListings.filter((l) => l.submittedBy === user.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const listing: Property = {
      id: "",
      title,
      type,
      location,
      area: location.split(",")[0].trim(),
      price: Number(price),
      rooms: Number(rooms),
      available: true,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      landlordName: user.name,
      landlordPhone: phone,
      description,
      amenities: [],
      utilities: {
        water: { available: true, cost: Number(waterCost) || 0 },
        electricity: { type: electricityType },
        wifi: { available: wifi },
        garbage: { cost: Number(garbageCost) || 0 },
      },
      postedDate: new Date().toISOString().split("T")[0],
    };
    submitListing(listing, user.email);
    toast({ title: "Listing submitted!", description: "Your property is pending admin review before going live." });
    setShowForm(false);
    setTitle(""); setLocation(""); setPrice(""); setRooms(""); setPhone(""); setDescription("");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Landlord Dashboard</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Add Listing"}
          </Button>
        </div>

        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
          <strong>Note:</strong> All submitted listings go through admin verification before appearing publicly. You'll be notified once reviewed.
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">New Property Listing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Property Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern 1BR in Kilimani" required />
              </div>
              <div>
                <Label>Location / Area</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kilimani, Nairobi" required />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as Property["type"])}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="bedsitter">Bedsitter</SelectItem>
                    <SelectItem value="single-room">Single Room</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Monthly Rent (KSh)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 25000" required />
              </div>
              <div>
                <Label>Number of Rooms</Label>
                <Input type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="e.g. 2" required />
              </div>
              <div>
                <Label>Your Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the property, amenities, and surroundings..." rows={3} />
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-2 font-display font-semibold">Utilities</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label>Wi-Fi Available</Label>
                    <Switch checked={wifi} onCheckedChange={setWifi} />
                  </div>
                  <div>
                    <Label>Water Cost (KSh/mo)</Label>
                    <Input type="number" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} placeholder="e.g. 800" />
                  </div>
                  <div>
                    <Label>Electricity Type</Label>
                    <Select value={electricityType} onValueChange={(v) => setElectricityType(v as "prepaid" | "monthly")}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepaid">Prepaid (Tokens)</SelectItem>
                        <SelectItem value="monthly">Monthly Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Garbage Fee (KSh/mo)</Label>
                    <Input type="number" value={garbageCost} onChange={(e) => setGarbageCost(e.target.value)} placeholder="e.g. 300" />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" className="mt-4">Submit for Review</Button>
          </form>
        )}

        {/* My submissions */}
        <h2 className="mb-4 font-display text-xl font-semibold">Your Submissions</h2>
        {myPending.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            You haven't submitted any listings yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myPending.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <img src={p.image} alt={p.title} className="h-20 w-28 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-display font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">{p.location} · KSh {p.price.toLocaleString()}/mo</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  p.status === "pending" ? "bg-accent/10 text-accent" :
                  p.status === "approved" ? "bg-success/10 text-success" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LandlordDashboard;
