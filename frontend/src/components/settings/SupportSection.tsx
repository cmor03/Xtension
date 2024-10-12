import { Button } from "../ui/button";

export default function SupportSection() {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-xl font-semibold">Support</span>
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          window.open("https://github.com/kodylow/replex/issues/new", "_blank")
        }
      >
        Contact
      </Button>
    </div>
  );
}
