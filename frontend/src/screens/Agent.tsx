import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../lib/utils";
import { useXAiApi } from "@/hooks/useXAi";

export default function Agent() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const xAiApi = useXAiApi();

  const processWithXAi = useCallback(
    async (userPrompt: string, systemPrompt: string) => {
      if (!xAiApi) throw new Error("XAiApi is not initialized");
      const messages = [{ role: "user" as const, content: userPrompt }];
      const response = await xAiApi.sendMessageWithSystemPrompt(
        messages,
        systemPrompt
      );
      console.log("Raw AI response:", response);
      if (!response) throw new Error("Failed to get response from XAiApi");

      if (
        typeof response === "object" &&
        response.choices &&
        response.choices.length > 0
      ) {
        const content = response.choices[0].message?.content;
        if (typeof content === "string") {
          console.log("Extracted content:", content);
          return content.trim();
        }
      }

      console.log("Response type:", typeof response);
      console.log("Response structure:", JSON.stringify(response, null, 2));
      throw new Error("Unexpected response format");
    },
    [xAiApi]
  );

  const handleBuildWithAgent = async () => {
    if (prompt.trim() === "") return;
    setIsLoading(true);
    try {
      const systemPrompt =
        "Think carefully about the program or application. Generate a prompt instructing how to build the program or application using python flask and vanilla javascript. The instruction will be given to an ai agent to build it, so structure your response appropriately for an ai to consume and act on it.";
      const processedPrompt = await processWithXAi(prompt, systemPrompt);
      console.log("Processed prompt:", processedPrompt); // Log the processed prompt
      const encodedPrompt = encodeURIComponent(processedPrompt);
      window.open(
        `https://replit.com/new/nix?tab=ai&q=${encodedPrompt}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error processing prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildWithV0 = async () => {
    if (prompt.trim() === "") return;
    setIsLoading(true);
    try {
      const systemPrompt =
        "Think carefully about the component. Generate a prompt speccing the component you want built using shadcn ui and react. The instruction will be given to an ai agent to build it, so structure your response appropriately for an ai to consume and act on it.";
      const processedPrompt = await processWithXAi(prompt, systemPrompt);
      const encodedPrompt = encodeURIComponent(processedPrompt);
      window.open(`https://v0.dev/chat?q=${encodedPrompt}`, "_blank");
    } catch (error) {
      console.error("Error processing prompt:", error);
    } finally {
      setIsLoading(false);
    }
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
            disabled={prompt.trim() === "" || isLoading}
            className={cn(
              "flex-grow",
              prompt.trim() === "" || isLoading
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            {isLoading ? "Processing..." : "Build with Agent"}
          </Button>
          <Button
            onClick={handleBuildWithV0}
            disabled={prompt.trim() === "" || isLoading}
            className={cn(
              "flex-grow",
              prompt.trim() === "" || isLoading
                ? "opacity-50 cursor-not-allowed"
                : ""
            )}
          >
            {isLoading ? "Processing..." : "Build with v0"}
          </Button>
        </div>
      </div>
    </div>
  );
}
