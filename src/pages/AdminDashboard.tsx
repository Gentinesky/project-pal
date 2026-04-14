import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Eye, Users, CreditCard, MessageSquare, Pencil, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DbUser {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  role?: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const { pendingListings, approvedListings, bookings, payments, smsLogs, approveListing, rejectListing, editListing, deleteListing } = useListings();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; price: string; location: string }>({ title: "", price: "", location: "" });
  const [allUsers, setAllUsers] = useState<DbUser[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUsers = async () => {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      if (profiles) {
        const mapped = profiles.map((p) => ({
          ...p,
          role: roles?.find((r) => r.user_id === p.user_id)?.role ?? "user",
        }));
        setAllUsers(mapped);
      }
    };
    fetchUsers();
  }, [isAdmin]);

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

  const startEdit = (p: typeof approvedListings[0]) => {
    setEditingId(p.id);
    setEditForm({ title: p.title, price: String(p.price), location: p.location });
  };

  const saveEdit = () => {
    if (!editingId) return;
    editListing(editingId, { title: editForm.title, price: Number(editForm.price), location: editForm.location });
    toast({ title: "Property updated" });
    setEditingId(null);
  };

  const handleDelete = (id: string, title: string) => {
    deleteListing(id);
    toast({ title: "Property deleted", description: `"${title}" removed.`, variant: "destructive" });
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-2 font-display text-3xl font-bold">Admin Dashboard</h1>
        <p className="mb-6 text-muted-foreground">Manage properties, users, bookings, payments & communications</p>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Clock, label: "Pending", value: pending.length, color: "text-accent" },
            { icon: CheckCircle, label: "Approved", value: pendingListings.filter((l) => l.status === "approved").length, color: "text-success" },
            { icon: Eye, label: "Listings", value: approvedListings.length, color: "text-primary" },
            { icon: CreditCard, label: "Bookings", value: bookings.length, color: "text-primary" },
            { icon: CreditCard, label: "Payments", value: payments.length, color: "text-success" },
            { icon: Users, label: "Users", value: allUsers.length, color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="verification" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="sms">SMS Logs</TabsTrigger>
          </TabsList>

          {/* 1. Verification Panel */}
          <TabsContent value="verification" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Pending Submissions</h2>
            {pending.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No pending submissions.</div>
            ) : (
              <div className="space-y-4">
                {pending.map((listing) => (
                  <div key={listing.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <img src={listing.image} alt={listing.title} className="h-20 w-28 rounded-lg object-cover" />
                      <div className="flex-1 space-y-1">
                        <h3 className="font-display font-semibold">{listing.title}</h3>
                        <p className="text-sm text-muted-foreground">📍 {listing.location} · KSh {listing.price.toLocaleString()}/mo · {listing.rooms} room(s)</p>
                        <p className="text-sm text-muted-foreground">👤 Landlord: {listing.landlordName} · 📞 {listing.landlordPhone}</p>
                        <p className="text-sm text-muted-foreground">💧 Water: KSh {listing.utilities.water.cost} · ⚡ {listing.utilities.electricity.type} · 📶 WiFi: {listing.utilities.wifi.available ? "Yes" : "No"} · 🗑️ Garbage: KSh {listing.utilities.garbage.cost}</p>
                        <p className="text-xs text-muted-foreground">Submitted by: {listing.submittedBy}</p>
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

            {reviewed.length > 0 && (
              <>
                <h2 className="mt-6 font-display text-xl font-semibold">Review History</h2>
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
          </TabsContent>

          {/* 2. All Properties Management */}
          <TabsContent value="properties" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">All Properties ({approvedListings.length})</h2>
            <div className="space-y-3">
              {approvedListings.map((p) => (
                <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                  <img src={p.image} alt={p.title} className="h-16 w-24 rounded-lg object-cover" />
                  {editingId === p.id ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="max-w-[200px]" />
                      <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="max-w-[150px]" />
                      <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="max-w-[120px]" />
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold">{p.title}</h3>
                        <p className="text-sm text-muted-foreground">{p.location} · KSh {p.price.toLocaleString()}/mo</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="gap-1">
                          <Pencil className="h-3 w-3" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id, p.title)} className="gap-1">
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 3. Booking Monitoring */}
          <TabsContent value="bookings" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">All Bookings ({bookings.length})</h2>
            {bookings.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No bookings yet.</div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{b.userName} ({b.userEmail})</p>
                        <p className="text-sm text-muted-foreground">{b.propertyTitle} · 📞 {b.userPhone}</p>
                        <p className="text-sm text-muted-foreground">"{b.message}"</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{b.status}</Badge>
                        <Badge className={b.paymentStatus === "paid" ? "bg-success/10 text-success border-0" : "bg-accent/10 text-accent border-0"}>
                          {b.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 4. User Management */}
          <TabsContent value="users" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">All Users ({allUsers.length})</h2>
            <div className="space-y-3">
              {allUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display font-bold text-primary">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{u.name} {u.blocked && <span className="text-destructive text-xs">(Blocked)</span>}</p>
                    <p className="text-sm text-muted-foreground">{u.email} · {u.role}</p>
                  </div>
                  {u.role !== "admin" && (
                    <Button
                      size="sm"
                      variant={u.blocked ? "outline" : "destructive"}
                      onClick={() => {
                        blockUser(u.id, !u.blocked);
                        toast({ title: u.blocked ? "User unblocked" : "User blocked" });
                      }}
                      className="gap-1"
                    >
                      <Ban className="h-3 w-3" /> {u.blocked ? "Unblock" : "Block"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 5. Payments Overview */}
          <TabsContent value="payments" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">Payments (M-Pesa) ({payments.length})</h2>
            {payments.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No payments recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex-1">
                      <p className="font-medium">{p.userName} · 📞 {p.userPhone}</p>
                      <p className="text-sm text-muted-foreground">Property: {p.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono">Tx: {p.transactionId}</p>
                    </div>
                    <p className="font-display text-lg font-bold text-success">KSh {p.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 6. SMS Logs */}
          <TabsContent value="sms" className="space-y-4">
            <h2 className="font-display text-xl font-semibold">SMS Logs (Gava Connect) ({smsLogs.length})</h2>
            {smsLogs.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No SMS sent yet.</div>
            ) : (
              <div className="space-y-3">
                {smsLogs.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">To: {s.to}</p>
                      <p className="text-sm text-muted-foreground">"{s.message}"</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge className={s.status === "delivered" ? "bg-success/10 text-success border-0" : s.status === "failed" ? "bg-destructive/10 text-destructive border-0" : "bg-accent/10 text-accent border-0"}>
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

export default AdminDashboard;
