import { useAppUser } from "@/hooks/useApp";
import { Separator } from "@radix-ui/react-separator";

export default function LightningAddressSection() {
  const currentUser = useAppUser();

  if (!currentUser) return null;

  return (
    <>
      <div className="flex flex-col space-y-2">
        <span className="text-xl font-semibold">Lightning Address</span>
        <div className="text-sm text-muted-foreground">
          {currentUser.name}@repl-ex.com
        </div>
      </div>
      <Separator />
    </>
  );
}
