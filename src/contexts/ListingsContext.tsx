import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { properties, type Property } from "@/data/properties";

export interface PendingListing extends Property {
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  createdAt: string;
  status: "pending" | "confirmed" | "cancelled";
}

interface ListingsContextType {
  approvedListings: Property[];
  pendingListings: PendingListing[];
  bookings: Booking[];
  submitListing: (listing: Property, submittedBy: string) => void;
  approveListing: (id: string) => void;
  rejectListing: (id: string) => void;
  createBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => void;
  getUserBookings: (userId: string) => Booking[];
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [approvedListings, setApprovedListings] = useState<Property[]>(properties);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const submitListing = useCallback((listing: Property, submittedBy: string) => {
    const pending: PendingListing = {
      ...listing,
      id: `pending-${Date.now()}`,
      submittedBy,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    setPendingListings((prev) => [...prev, pending]);
  }, []);

  const approveListing = useCallback((id: string) => {
    setPendingListings((prev) => {
      const listing = prev.find((l) => l.id === id);
      if (listing) {
        const { submittedBy, submittedAt, status, ...property } = listing;
        const approved: Property = { ...property, id: `prop-${Date.now()}` };
        setApprovedListings((a) => [...a, approved]);
      }
      return prev.map((l) => (l.id === id ? { ...l, status: "approved" as const } : l));
    });
  }, []);

  const rejectListing = useCallback((id: string) => {
    setPendingListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "rejected" as const } : l))
    );
  }, []);

  const createBooking = useCallback(
    (booking: Omit<Booking, "id" | "createdAt" | "status">) => {
      const newBooking: Booking = {
        ...booking,
        id: `booking-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setBookings((prev) => [...prev, newBooking]);
    },
    []
  );

  const getUserBookings = useCallback(
    (userId: string) => bookings.filter((b) => b.userId === userId),
    [bookings]
  );

  return (
    <ListingsContext.Provider
      value={{
        approvedListings,
        pendingListings,
        bookings,
        submitListing,
        approveListing,
        rejectListing,
        createBooking,
        getUserBookings,
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
