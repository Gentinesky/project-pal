import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useListings, type Property } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const LandlordDashboard = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { allProperties, bookings, submitListing } = useListings();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
  const [images, setImages] = useState<string[]>([]);

  if (authLoading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isLoggedIn || user?.role !== "landlord") {
    return <Navigate to="/login" replace />;
  }

  const myPending = allProperties.filter((l) => l.landlordId === user.id);
  const myPropertyIds = new Set(myPending.map((p) => p.id));
  const myBookings = bookings.filter((b) => myPropertyIds.has(b.propertyId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const id = await submitListing({
      title,
      type,
      location,
      area: location.split(",")[0].trim(),
      price: Number(price),
      rooms: Number(rooms),
      available: true,
      image: images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
      images,
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
    });
    setSubmitting(false);
    if (!id) {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Listing submitted!", description: "Your property is pending admin review." });
    setShowForm(false);
    setTitle(""); setLocation(""); setPrice(""); setRooms(""); setPhone(""); setDescription(""); setImages([]);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">Landlord Dashboard</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "Add Property"}
          </Button>
        </div>

        <div className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-accent-foreground">
          <strong>Note:</strong> All submitted listings go through admin verification before appearing publicly.
        </div>

        {/* Add Property Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">New Property Listing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Property Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Modern 1BR in Kilimani" required />
              </div>
              <div>
                <Label>Location</Label>
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
                <Label>Phone Number</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the property..." rows={3} />
              </div>
              <div className="sm:col-span-2">
                <ImageUpload images={images} onChange={setImages} maxImages={5} />
              </div>
              <div className="sm:col-span-2">
                <h3 className="mb-2 font-display font-semibold">Utilities</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label>Wi-Fi Available</Label>
                    <Switch checked={wifi} onCheckedChange={setWifi} />
                  </div>
                  <div>
                    <Label>Water Charges (KSh/mo)</Label>
                    <Input type="number" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} placeholder="e.g. 800" />
                  </div>
                  <div>
                    <Label>Electricity Type</Label>
                    <Select value={electricityType} onValueChange={(v) => setElectricityType(v as "prepaid" | "monthly")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button type="submit" className="mt-4" disabled={submitting}>{submitting ? "Submitting..." : "Submit for Review"}</Button>
          </form>
        )}

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            <TabsTrigger value="notifications">SMS Notifications</TabsTrigger>
          </TabsList>

          {/* Property Status Tracking & View Listings */}
          <TabsContent value="listings" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Your Submissions ({myPending.length})</h2>
            {myPending.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                You haven't submitted any listings yet.
              </div>
            ) : (
              <div className="space-y-4">
                {myPending.map((p) => (
                  <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                    <img src={p.image} alt={p.title} className="h-20 w-28 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h3 className="font-display font-semibold">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{p.location} · KSh {p.price.toLocaleString()}/mo · {p.rooms} room(s)</p>
                      <p className="text-sm text-muted-foreground">💧 Water: KSh {p.utilities.water.cost} · ⚡ {p.utilities.electricity.type} · 📶 WiFi: {p.utilities.wifi.available ? "Yes" : "No"}</p>
                    </div>
                    <Badge className={
                      p.status === "pending" ? "bg-accent/10 text-accent border-0" :
                      p.status === "approved" ? "bg-success/10 text-success border-0" :
                      "bg-destructive/10 text-destructive border-0"
                    }>
                      {p.status === "pending" ? "⏳ Pending" : p.status === "approved" ? "✅ Approved" : "❌ Rejected"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Booking Requests */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Booking Requests</h2>
            {myBookings.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No booking requests yet.
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-medium">{b.userName} wants to book "{b.propertyTitle}"</p>
                    <p className="text-sm text-muted-foreground">📞 {b.userPhone} · ✉️ {b.userEmail}</p>
                    <p className="text-sm text-muted-foreground">"{b.message}"</p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="secondary">{b.status}</Badge>
                      <Badge className={b.paymentStatus === "paid" ? "bg-success/10 text-success border-0" : "bg-accent/10 text-accent border-0"}>
                        {b.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SMS Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">SMS Notifications (Gava Connect)</h2>
            {mySmsLogs.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                No SMS notifications yet. You'll receive SMS when someone books your property.
              </div>
            ) : (
              <div className="space-y-3">
                {mySmsLogs.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <div className="flex-1">
                      <p className="text-sm">{s.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={s.status === "delivered" ? "bg-success/10 text-success border-0" : "bg-destructive/10 text-destructive border-0"}>
                      {s.status}
                    </Badge>
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

export default LandlordDashboard;
