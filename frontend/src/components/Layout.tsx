export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-[300px] min-h-[400px] flex flex-col">{children}</div>
  );
}
