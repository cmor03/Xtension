import { Button } from "./ui/button";

interface ActionButtonsProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
}

export default function ActionButtons({
  onSendClick,
  onReceiveClick,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-center space-x-4">
      <Button onClick={onSendClick}>Send</Button>
      <Button onClick={onReceiveClick}>Receive</Button>
    </div>
  );
}
