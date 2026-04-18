import { useState } from "react";
import { Phone, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MpesaPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  propertyTitle: string;
  onPay: (
    phone: string
  ) => Promise<{ ok: boolean; transactionId?: string; mode?: string; error?: string }>;
  onComplete: () => void;
}

type Step = "input" | "processing" | "success" | "error";

const MpesaPaymentDialog = ({
  open,
  onOpenChange,
  amount,
  propertyTitle,
  onPay,
  onComplete,
}: MpesaPaymentDialogProps) => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [txId, setTxId] = useState("");
  const [mode, setMode] = useState<string>("");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("processing");
    const result = await onPay(phone);
    if (result.ok) {
      setTxId(result.transactionId ?? "");
      setMode(result.mode ?? "");
      setStep("success");
    } else {
      setErrMsg(result.error ?? "Payment failed");
      setStep("error");
    }
  };

  const handleClose = () => {
    if (step === "success") onComplete();
    onOpenChange(false);
    setTimeout(() => {
      setStep("input");
      setPhone("");
      setTxId("");
      setErrMsg("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
              <Phone className="h-4 w-4 text-success" />
            </span>
            M-Pesa Payment
          </DialogTitle>
        </DialogHeader>

        {step === "input" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Booking deposit for</p>
              <p className="font-display font-semibold">{propertyTitle}</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                KSh {amount.toLocaleString()}
              </p>
            </div>
            <div>
              <Label htmlFor="mpesa-phone">M-Pesa Phone Number</Label>
              <Input
                id="mpesa-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                pattern="^(07|01|2547|2541|\+2547|\+2541)\d{7,8}$"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                An STK push will be sent to this number
              </p>
            </div>
            <Button type="submit" className="w-full">
              Pay KSh {amount.toLocaleString()}
            </Button>
          </form>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div>
              <p className="font-display font-semibold">Processing Payment</p>
              <p className="text-sm text-muted-foreground">
                Check your phone for the M-Pesa prompt and enter your PIN
              </p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-success" />
            <div>
              <p className="font-display text-lg font-semibold">
                Payment Successful!
              </p>
              <p className="text-sm text-muted-foreground">
                Transaction ID:{" "}
                <span className="font-mono font-medium">{txId}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                KSh {amount.toLocaleString()} paid via M-Pesa
              </p>
              {mode === "simulated" && (
                <p className="mt-2 text-xs text-accent">
                  (Simulated — add Daraja API keys to enable real payments)
                </p>
              )}
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-display text-lg font-semibold">
                Payment Failed
              </p>
              <p className="text-sm text-muted-foreground">{errMsg}</p>
            </div>
            <Button onClick={() => setStep("input")} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPaymentDialog;
