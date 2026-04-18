import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============= Domain Types =============

export interface Property {
  id: string;
  title: string;
  type: "apartment" | "bedsitter" | "single-room" | "house";
  location: string;
  area: string;
  price: number;
  rooms: number;
  available: boolean;
  image: string;
  images: string[];
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  description: string;
  amenities: string[];
  utilities: {
    water: { available: boolean; cost: number };
    electricity: { type: "prepaid" | "monthly"; cost?: number };
    wifi: { available: boolean; cost?: number };
    garbage: { cost: number };
  };
  postedDate: string;
  status: "pending" | "approved" | "rejected";
  submittedBy?: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid";
}

export interface Payment {
  id: string;
  bookingId: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  transactionId: string;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  to: string;
  message: string;
  status: "delivered" | "failed" | "pending";
  createdAt: string;
  type: "booking_notification" | "contact_landlord";
}

// ============= DB row -> domain helpers =============

interface UtilitiesJson {
  water?: { available?: boolean; cost?: number };
  electricity?: { type?: "prepaid" | "monthly"; cost?: number };
  wifi?: { available?: boolean; cost?: number };
  garbage?: { cost?: number };
  amenities?: string[];
  landlordName?: string;
  landlordPhone?: string;
  area?: string;
  available?: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80";

const parseUtilities = (raw: string | null): UtilitiesJson => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const dbPropertyToDomain = (
  row: Record<string, unknown>,
  profilesMap: Map<string, { name: string; phone: string }>
): Property => {
  const u = parseUtilities(row.utilities as string | null);
  const profile = profilesMap.get(row.landlord_id as string);
  const images = (row.images as string[]) ?? [];
  return {
    id: row.id as string,
    title: row.title as string,
    type: (row.type as Property["type"]) ?? "apartment",
    location: row.location as string,
    area: u.area ?? (row.location as string).split(",")[0].trim(),
    price: Number(row.rent),
    rooms: Number(row.bedrooms ?? 1),
    available: u.available !== false,
    image: images[0] ?? FALLBACK_IMAGE,
    images,
    landlordId: row.landlord_id as string,
    landlordName: u.landlordName ?? profile?.name ?? "Landlord",
    landlordPhone: u.landlordPhone ?? profile?.phone ?? "",
    description: (row.description as string) ?? "",
    amenities: u.amenities ?? [],
    utilities: {
      water: { available: u.water?.available ?? true, cost: u.water?.cost ?? 0 },
      electricity: {
        type: u.electricity?.type ?? "prepaid",
        cost: u.electricity?.cost,
      },
      wifi: { available: u.wifi?.available ?? false, cost: u.wifi?.cost },
      garbage: { cost: u.garbage?.cost ?? 0 },
    },
    postedDate: (row.created_at as string).split("T")[0],
    status: row.status as Property["status"],
    submittedBy: row.landlord_id as string,
  };
};

// ============= Context shape =============

interface ListingsContextType {
  approvedListings: Property[];
  pendingListings: Property[];
  allProperties: Property[];
  bookings: Booking[];
  payments: Payment[];
  smsLogs: SmsLog[];
  loading: boolean;

  submitListing: (
    listing: Omit<Property, "id" | "status" | "postedDate" | "landlordId" | "submittedBy"> & {
      images: string[];
    }
  ) => Promise<string | null>;
  approveListing: (id: string) => Promise<void>;
  rejectListing: (id: string) => Promise<void>;
  editListing: (
    id: string,
    updates: { title?: string; price?: number; location?: string }
  ) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  createBooking: (input: {
    propertyId: string;
    propertyTitle: string;
    userPhone: string;
    message: string;
  }) => Promise<string | null>;
  cancelBooking: (id: string) => Promise<void>;

  payForBooking: (input: {
    bookingId: string;
    propertyId: string;
    propertyTitle: string;
    phone: string;
    amount: number;
  }) => Promise<{ ok: boolean; transactionId?: string; mode?: string; error?: string }>;

  sendSms: (
    to: string,
    message: string,
    type: SmsLog["type"]
  ) => Promise<void>;

  refresh: () => Promise<void>;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

// ============= Provider =============

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAdmin, session } = useAuth();
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [profilesMap, setProfilesMap] = useState<
    Map<string, { name: string; phone: string }>
  >(new Map());
  const [propertyTitleMap, setPropertyTitleMap] = useState<Map<string, string>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    // Anyone can read approved; logged-in landlords see own; admin sees all (RLS handles)
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("loadProperties:", error);
      return;
    }
    const landlordIds = Array.from(
      new Set((data ?? []).map((p) => p.landlord_id))
    );
    let pmap = profilesMap;
    if (landlordIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", landlordIds);
      pmap = new Map(
        (profs ?? []).map((p) => [
          p.user_id,
          { name: p.full_name, phone: p.phone ?? "" },
        ])
      );
      setProfilesMap(pmap);
    }
    const props = (data ?? []).map((row) => dbPropertyToDomain(row, pmap));
    setAllProperties(props);
    setPropertyTitleMap(new Map(props.map((p) => [p.id, p.title])));
  }, [profilesMap]);

  const loadBookings = useCallback(async () => {
    if (!session) {
      setBookings([]);
      return;
    }
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("loadBookings:", error);
      return;
    }
    // Need user names for display
    const userIds = Array.from(new Set((data ?? []).map((b) => b.user_id)));
    let userMap = new Map<string, { name: string; email: string }>();
    if (userIds.length && isAdmin) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      userMap = new Map(
        (profs ?? []).map((p) => [
          p.user_id,
          { name: p.full_name, email: "" },
        ])
      );
    }
    setBookings(
      (data ?? []).map((b) => ({
        id: b.id,
        propertyId: b.property_id,
        propertyTitle: propertyTitleMap.get(b.property_id) ?? "Property",
        userId: b.user_id,
        userName:
          b.user_id === user?.id
            ? user.name
            : userMap.get(b.user_id)?.name ?? "User",
        userEmail: b.user_id === user?.id ? user.email : "",
        userPhone: b.user_phone,
        message: b.message ?? "",
        createdAt: b.created_at,
        status: b.status,
        paymentStatus: b.payment_status,
      }))
    );
  }, [session, isAdmin, user, propertyTitleMap]);

  const loadPayments = useCallback(async () => {
    if (!session) {
      setPayments([]);
      return;
    }
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("loadPayments:", error);
      return;
    }
    let userMap = new Map<string, string>();
    if (isAdmin) {
      const userIds = Array.from(new Set((data ?? []).map((p) => p.user_id)));
      if (userIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        userMap = new Map((profs ?? []).map((p) => [p.user_id, p.full_name]));
      }
    }
    setPayments(
      (data ?? []).map((p) => ({
        id: p.id,
        bookingId: p.booking_id,
        propertyId: p.property_id,
        propertyTitle: propertyTitleMap.get(p.property_id) ?? "Property",
        userId: p.user_id,
        userName:
          p.user_id === user?.id ? user.name : userMap.get(p.user_id) ?? "User",
        userPhone: p.phone,
        amount: Number(p.amount),
        transactionId: p.transaction_id,
        createdAt: p.created_at,
      }))
    );
  }, [session, isAdmin, user, propertyTitleMap]);

  const loadSmsLogs = useCallback(async () => {
    if (!isAdmin) {
      setSmsLogs([]);
      return;
    }
    const { data, error } = await supabase
      .from("sms_logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("loadSmsLogs:", error);
      return;
    }
    setSmsLogs(
      (data ?? []).map((s) => ({
        id: s.id,
        to: s.recipient,
        message: s.message,
        status: s.status,
        type: s.type,
        createdAt: s.created_at,
      }))
    );
  }, [isAdmin]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await loadProperties();
    setLoading(false);
  }, [loadProperties]);

  // Initial load + on auth change
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    loadBookings();
    loadPayments();
    loadSmsLogs();
  }, [loadBookings, loadPayments, loadSmsLogs, propertyTitleMap]);

  // Realtime subscriptions
  useEffect(() => {
    const ch = supabase
      .channel("listings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => loadProperties()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => loadBookings()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => loadPayments()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sms_logs" },
        () => loadSmsLogs()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [loadProperties, loadBookings, loadPayments, loadSmsLogs]);

  // ============ Mutations ============

  const submitListing: ListingsContextType["submitListing"] = useCallback(
    async (listing) => {
      if (!user) return null;
      const utilities = JSON.stringify({
        water: listing.utilities.water,
        electricity: listing.utilities.electricity,
        wifi: listing.utilities.wifi,
        garbage: listing.utilities.garbage,
        amenities: listing.amenities,
        landlordName: listing.landlordName,
        landlordPhone: listing.landlordPhone,
        area: listing.area,
        available: listing.available,
      });
      const { data, error } = await supabase
        .from("properties")
        .insert({
          landlord_id: user.id,
          title: listing.title,
          type: listing.type,
          location: listing.location,
          rent: listing.price,
          bedrooms: listing.rooms,
          description: listing.description,
          images: listing.images,
          utilities,
          status: "pending",
        })
        .select()
        .single();
      if (error) {
        console.error("submitListing:", error);
        return null;
      }
      await loadProperties();
      return data.id;
    },
    [user, loadProperties]
  );

  const approveListing = useCallback(async (id: string) => {
    await supabase.from("properties").update({ status: "approved" }).eq("id", id);
    await loadProperties();
  }, [loadProperties]);

  const rejectListing = useCallback(async (id: string) => {
    await supabase.from("properties").update({ status: "rejected" }).eq("id", id);
    await loadProperties();
  }, [loadProperties]);

  const editListing = useCallback(
    async (
      id: string,
      updates: { title?: string; price?: number; location?: string }
    ) => {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.price !== undefined) payload.rent = updates.price;
      if (updates.location !== undefined) payload.location = updates.location;
      await supabase.from("properties").update(payload).eq("id", id);
      await loadProperties();
    },
    [loadProperties]
  );

  const deleteListing = useCallback(
    async (id: string) => {
      await supabase.from("properties").delete().eq("id", id);
      await loadProperties();
    },
    [loadProperties]
  );

  const createBooking: ListingsContextType["createBooking"] = useCallback(
    async (input) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          property_id: input.propertyId,
          user_phone: input.userPhone,
          message: input.message,
        })
        .select()
        .single();
      if (error) {
        console.error("createBooking:", error);
        return null;
      }
      await loadBookings();
      return data.id;
    },
    [user, loadBookings]
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      await loadBookings();
    },
    [loadBookings]
  );

  const payForBooking: ListingsContextType["payForBooking"] = useCallback(
    async (input) => {
      const { data, error } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone: input.phone,
          amount: input.amount,
          bookingId: input.bookingId,
          propertyId: input.propertyId,
          propertyTitle: input.propertyTitle,
        },
      });
      if (error) {
        console.error("payForBooking:", error);
        return { ok: false, error: error.message };
      }
      await loadBookings();
      await loadPayments();
      return {
        ok: true,
        transactionId: data?.transactionId,
        mode: data?.mode,
      };
    },
    [loadBookings, loadPayments]
  );

  const sendSms = useCallback(
    async (to: string, message: string, type: SmsLog["type"]) => {
      const { error } = await supabase.functions.invoke("send-sms", {
        body: { to, message, type },
      });
      if (error) console.error("sendSms:", error);
      if (isAdmin) await loadSmsLogs();
    },
    [isAdmin, loadSmsLogs]
  );

  const approvedListings = allProperties.filter((p) => p.status === "approved");
  const pendingListings = allProperties.filter((p) => p.status !== "approved" || true)
    .filter((p) => p.status === "pending" || p.status === "rejected" || p.status === "approved");
  // Admin verification panel: show all that ever were submitted (pending + approved + rejected)
  const adminPending = allProperties;

  return (
    <ListingsContext.Provider
      value={{
        approvedListings,
        pendingListings: adminPending,
        allProperties,
        bookings,
        payments,
        smsLogs,
        loading,
        submitListing,
        approveListing,
        rejectListing,
        editListing,
        deleteListing,
        createBooking,
        cancelBooking,
        payForBooking,
        sendSms,
        refresh,
      }}
    >
      {children}
    </ListingsContext.Provider>
  );
};

export const useListings = () => {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
};
