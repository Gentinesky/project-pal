import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useListings } from "@/contexts/ListingsContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import MpesaPaymentDialog from "@/components/MpesaPaymentDialog";

interface BookingDialogProps {
  propertyId: string;
  propertyTitle: string;
  available: boolean;
  price: number;
  landlordPhone: string;
  landlordName: string;
}

const BookingDialog = ({
  propertyId,
  propertyTitle,
  available,
  price,
  landlordPhone,
  landlordName,
}: BookingDialogProps) => {
  const { user, isLoggedIn } = useAuth();
  const { createBooking, payForBooking, sendSms } = useListings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!available) {
    return (
      <Button disabled className="w-full" size="lg">
        Currently Occupied
      </Button>
    );
  }

  const handleClick = () => {
    if (!isLoggedIn) {
      toast({
        title: "Login required",
        description: "Please sign in to book a property.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const id = await createBooking({
      propertyId,
      propertyTitle,
      userPhone: phone,
      message: message || `I'm interested in "${propertyTitle}"`,
    });
    setSubmitting(false);
    if (!id) {
      toast({
        title: "Booking failed",
        description: "Could not create booking. Try again.",
        variant: "destructive",
      });
      return;
    }
    setBookingId(id);
    setOpen(false);
    setShowPayment(true);
  };

  const handlePay = async (mpesaPhone: string) => {
    if (!bookingId) return { ok: false, error: "No booking" };
    const result = await payForBooking({
      bookingId,
      propertyId,
      propertyTitle,
      phone: mpesaPhone,
      amount: price,
    });
    if (result.ok) {
      // Notify landlord via SMS
      await sendSms(
        landlordPhone,
        `New booking for "${propertyTitle}" by ${user?.name}. Phone: ${phone}. Deposit paid: KSh ${price.toLocaleString()}`,
        "booking_notification"
      );
    }
    return result;
  };

  const handleComplete = () => {
    toast({
      title: "Booking confirmed!",
      description: `${landlordName} has been notified.`,
    });
    setShowPayment(false);
    setPhone("");
    setMessage("");
    setBookingId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2" size="lg" onClick={handleClick}>
            <CalendarCheck className="h-4 w-4" />
            Book This Property
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              Book: {propertyTitle}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input value={user?.name || ""} disabled />
            </div>
            <div>
              <Label>Your Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="When would you like to view the property?"
                rows={3}
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                Booking deposit (1 month rent):
              </p>
              <p className="font-display text-lg font-bold text-primary">
                KSh {price.toLocaleString()}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creating booking..." : "Proceed to Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <MpesaPaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        amount={price}
        propertyTitle={propertyTitle}
        onPay={handlePay}
        onComplete={handleComplete}
      />
    </>
  );
};

export default BookingDialog;
