import { Card, CardContent, CardHeader } from "../components/ui/card";

export default function SettingsScreen() {
  return (
    <Card className="w-full max-w-md mx-auto border-none">
      <CardHeader>
        <h2 className="text-xl font-bold">Settings</h2>
      </CardHeader>
      <CardContent>
        {/* Add your settings options here */}
        <p>Settings options will go here.</p>
      </CardContent>
    </Card>
  );
}
