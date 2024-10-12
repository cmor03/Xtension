import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../lib/utils";

export default function Agent() {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleBuildWithAgent = () => {
    if (prompt.trim() === "") return;
    const encodedPrompt = encodeURIComponent(prompt);
    window.open(
      `https://replit.com/new/nix?tab=ai&q=${encodedPrompt}`,
      "_blank"
    );
  };

  const handleBuildWithV0 = () => {
    if (prompt.trim() === "") return;
    const encodedPrompt = encodeURIComponent(prompt);
    window.open(`https://v0.dev/chat?q=${encodedPrompt}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full h-full resize-none"
        />
      </div>
      <div className="mt-4">
        <div className="flex space-x-2">
          <Button
            onClick={handleBuildWithAgent}
            disabled={prompt.trim() === ""}
            className={cn(
              "flex-grow",
              prompt.trim() === "" ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            Build with Agent
          </Button>
          <Button
            onClick={handleBuildWithV0}
            disabled={prompt.trim() === ""}
            className={cn(
              "flex-grow",
              prompt.trim() === "" ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            Build with v0
          </Button>
        </div>
      </div>
    </div>
  );
}
