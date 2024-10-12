export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-[600px] min-h-[800px] flex flex-col">{children}</div>
  );
}
