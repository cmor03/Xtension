import { Separator } from "../components/ui/separator";
import ReplitAccountSection from "../components/settings/ReplitAccountSection";
import LightningAddressSection from "../components/settings/LightningAddressSection";
import SupportSection from "../components/settings/SupportSection";

export default function SettingsScreen() {
  return (
    <div className="container mx-auto min-h-screen max-w-2xl px-4">
      <h1 className="text-4xl font-bold mb-6">Settings</h1>
      <Separator className="mb-8" />
      <div className="space-y-12">
        <ReplitAccountSection />
        <LightningAddressSection />
        <SupportSection />
      </div>
    </div>
  );
}
