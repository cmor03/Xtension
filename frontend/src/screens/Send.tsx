import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useWalletInstance } from "@/hooks/useWallet";

interface SendScreenProps {
  onComplete: () => void;
}

export default function SendScreen({ onComplete }: SendScreenProps) {
  const wallet = useWalletInstance();
  const [invoice, setInvoice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      await wallet.lightning.payInvoice(invoice);
      onComplete();
    } catch (e) {
      console.error("Error sending Lightning payment", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <Label htmlFor="invoice">Invoice</Label>
      <Input
        id="invoice"
        type="text"
        placeholder="Enter Lightning invoice"
        value={invoice}
        onChange={(e) => setInvoice(e.target.value)}
        className="mt-1"
      />
      <div className="flex justify-between mt-2 gap-2">
        <Button type="submit" className="flex-1" disabled={sending}>
          {sending ? "Sending..." : "Send"}
        </Button>
        <Button type="button" onClick={onComplete} className="flex-1">
          Cancel
        </Button>
      </div>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
}
