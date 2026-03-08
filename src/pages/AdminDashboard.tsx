import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { pendingListings, bookings, approveListing, rejectListing } = useListings();
  const { toast } = useToast();

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const pending = pendingListings.filter((l) => l.status === "pending");
  const reviewed = pendingListings.filter((l) => l.status !== "pending");

  const handleApprove = (id: string, title: string) => {
    approveListing(id);
    toast({ title: "Listing approved", description: `"${title}" is now live.` });
  };

  const handleReject = (id: string, title: string) => {
    rejectListing(id);
    toast({ title: "Listing rejected", description: `"${title}" has been rejected.`, variant: "destructive" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mb-8 text-muted-foreground">Review and verify landlord property submissions</p>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingListings.filter((l) => l.status === "approved").length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending listings */}
        <h2 className="mb-4 font-display text-xl font-semibold">Pending Submissions</h2>
        {pending.length === 0 ? (
          <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No pending submissions to review.
          </div>
        ) : (
          <div className="mb-8 space-y-4">
            {pending.map((listing) => (
              <div key={listing.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={listing.image} alt={listing.title} className="h-20 w-28 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-display font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{listing.location} · KSh {listing.price.toLocaleString()}/mo · {listing.rooms} room(s)</p>
                    <p className="text-sm text-muted-foreground">Submitted by: {listing.submittedBy}</p>
                    <p className="text-sm text-muted-foreground">Landlord: {listing.landlordName} · {listing.landlordPhone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(listing.id, listing.title)} className="gap-1">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(listing.id, listing.title)} className="gap-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviewed listings */}
        {reviewed.length > 0 && (
          <>
            <h2 className="mb-4 font-display text-xl font-semibold">Review History</h2>
            <div className="space-y-3">
              {reviewed.map((listing) => (
                <div key={listing.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex-1">
                    <h3 className="font-display font-semibold">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">{listing.location}</p>
                  </div>
                  <Badge className={listing.status === "approved" ? "bg-success/10 text-success border-0" : "bg-destructive/10 text-destructive border-0"}>
                    {listing.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bookings */}
        {bookings.length > 0 && (
          <>
            <h2 className="mb-4 mt-8 font-display text-xl font-semibold">Recent Bookings</h2>
            <div className="space-y-3">
              {bookings.map((b) => {
                return (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-medium">{b.userName} ({b.userEmail})</p>
                    <p className="text-sm text-muted-foreground">Property ID: {b.propertyId} · Phone: {b.userPhone}</p>
                    <p className="text-sm text-muted-foreground">"{b.message}"</p>
                    <Badge variant="secondary" className="mt-1">{b.status}</Badge>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
