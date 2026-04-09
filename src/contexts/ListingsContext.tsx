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

interface ListingsContextType {
  approvedListings: Property[];
  pendingListings: PendingListing[];
  bookings: Booking[];
  payments: Payment[];
  smsLogs: SmsLog[];
  submitListing: (listing: Property, submittedBy: string) => void;
  approveListing: (id: string) => void;
  rejectListing: (id: string) => void;
  editListing: (id: string, updates: Partial<Property>) => void;
  deleteListing: (id: string) => void;
  createBooking: (booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus">) => string;
  getUserBookings: (userId: string) => Booking[];
  addPayment: (payment: Omit<Payment, "id" | "createdAt">) => void;
  sendSms: (to: string, message: string, type: SmsLog["type"]) => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  markBookingPaid: (bookingId: string) => void;
}

const ListingsContext = createContext<ListingsContextType | null>(null);

export const ListingsProvider = ({ children }: { children: ReactNode }) => {
  const [approvedListings, setApprovedListings] = useState<Property[]>(properties);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);

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

  const editListing = useCallback((id: string, updates: Partial<Property>) => {
    setApprovedListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  const deleteListing = useCallback((id: string) => {
    setApprovedListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const createBooking = useCallback(
    (booking: Omit<Booking, "id" | "createdAt" | "status" | "paymentStatus">): string => {
      const id = `booking-${Date.now()}`;
      const newBooking: Booking = {
        ...booking,
        id,
        createdAt: new Date().toISOString(),
        status: "pending",
        paymentStatus: "unpaid",
      };
      setBookings((prev) => [...prev, newBooking]);
      return id;
    },
    []
  );

  const getUserBookings = useCallback(
    (userId: string) => bookings.filter((b) => b.userId === userId),
    [bookings]
  );

  const addPayment = useCallback(
    (payment: Omit<Payment, "id" | "createdAt">) => {
      const newPayment: Payment = {
        ...payment,
        id: `pay-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setPayments((prev) => [...prev, newPayment]);
    },
    []
  );

  const markBookingPaid = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, paymentStatus: "paid" as const, status: "confirmed" as const } : b))
    );
  }, []);

  const updateBookingStatus = useCallback((bookingId: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  }, []);

  const sendSms = useCallback((to: string, message: string, type: SmsLog["type"]) => {
    const sms: SmsLog = {
      id: `sms-${Date.now()}`,
      to,
      message,
      status: Math.random() > 0.1 ? "delivered" : "failed",
      createdAt: new Date().toISOString(),
      type,
    };
    setSmsLogs((prev) => [...prev, sms]);
  }, []);

  return (
    <ListingsContext.Provider
      value={{
        approvedListings,
        pendingListings,
        bookings,
        payments,
        smsLogs,
        submitListing,
        approveListing,
        rejectListing,
        editListing,
        deleteListing,
        createBooking,
        getUserBookings,
        addPayment,
        sendSms,
        updateBookingStatus,
        markBookingPaid,
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
