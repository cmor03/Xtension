interface BalanceDisplayProps {
  balance: number;
}

export default function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold">Balance</h2>
      <p className="text-4xl font-bold text-primary">{balance} sats</p>
    </div>
  );
}
