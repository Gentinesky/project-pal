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
import { properties } from "@/data/properties";
import { useToast } from "@/hooks/use-toast";

const LandlordDashboard = () => {
  const { toast } = useToast();
  const [myListings] = useState(properties.slice(0, 2));
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Listing submitted!", description: "Your property has been added successfully." });
    setShowForm(false);
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

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-xl font-semibold">New Property Listing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Property Title</Label>
                <Input placeholder="e.g. Modern 1BR in Kilimani" required />
              </div>
              <div>
                <Label>Location / Area</Label>
                <Input placeholder="e.g. Kilimani, Nairobi" required />
              </div>
              <div>
                <Label>Property Type</Label>
                <Select>
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
                <Input type="number" placeholder="e.g. 25000" required />
              </div>
              <div>
                <Label>Number of Rooms</Label>
                <Input type="number" placeholder="e.g. 2" required />
              </div>
              <div>
                <Label>Your Phone Number</Label>
                <Input placeholder="+254 7XX XXX XXX" required />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the property, amenities, and surroundings..." rows={3} />
              </div>

              <div className="sm:col-span-2">
                <h3 className="mb-2 font-display font-semibold">Utilities</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <Label>Wi-Fi Available</Label>
                    <Switch />
                  </div>
                  <div>
                    <Label>Water Cost (KSh/mo)</Label>
                    <Input type="number" placeholder="e.g. 800" />
                  </div>
                  <div>
                    <Label>Electricity Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prepaid">Prepaid (Tokens)</SelectItem>
                        <SelectItem value="monthly">Monthly Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Garbage Fee (KSh/mo)</Label>
                    <Input type="number" placeholder="e.g. 300" />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" className="mt-4">Submit Listing</Button>
          </form>
        )}

        {/* Existing listings */}
        <h2 className="mb-4 font-display text-xl font-semibold">Your Listings</h2>
        <div className="space-y-4">
          {myListings.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <img src={p.image} alt={p.title} className="h-20 w-28 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-display font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.location} · KSh {p.price.toLocaleString()}/mo</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.available ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {p.available ? "Available" : "Occupied"}
              </span>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandlordDashboard;
