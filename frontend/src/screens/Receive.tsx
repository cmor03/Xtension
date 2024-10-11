import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import wallet from "../wallet";

interface ReceiveScreenProps {
  onComplete: () => void;
}

export default function ReceiveScreen({ onComplete }: ReceiveScreenProps) {
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoice("");
    setError("");
    setGenerating(true);

    try {
      const response = await wallet.lightning.createInvoice(
        Number(amount),
        "Receive payment"
      );
      setInvoice(response.invoice);

      // Wait for payment to be received
      await wallet.lightning.subscribeLnReceive(response.invoice);

      onComplete();
    } catch (e) {
      console.error("Error generating or receiving Lightning invoice", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Receive Payment</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="amount">Amount (sats)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount to receive"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex justify-between gap-2">
          <Button type="submit" className="flex-1" disabled={generating}>
            {generating ? "Generating..." : "Generate Invoice"}
          </Button>
          <Button type="button" onClick={onComplete} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
      {invoice && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Generated Invoice:</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {invoice}
          </pre>
          <Button
            onClick={() => navigator.clipboard.writeText(invoice)}
            className="mt-2"
          >
            Copy Invoice
          </Button>
        </div>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
