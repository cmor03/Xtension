import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "../lib/utils";
import { useXAiApi } from "@/hooks/useXAi";
import ReactMarkdown from "react-markdown";

export default function Agent() {
  const [prompt, setPrompt] = useState("");
  const [processedPrompt, setProcessedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [buildTarget, setBuildTarget] = useState<"agent" | "v0" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const xAiApi = useXAiApi();
  const [showProcessedPrompt, setShowProcessedPrompt] = useState(false);
  const processedPromptRef = useRef<HTMLDivElement>(null);

  const processWithXAi = useCallback(
    async (userPrompt: string, systemPrompt: string) => {
      if (!xAiApi) throw new Error("XAiApi is not initialized");
      const messages = [{ role: "user" as const, content: userPrompt }];

      setIsStreaming(true);
      setProcessedPrompt("");

      try {
        const stream = await xAiApi.sendMessageWithSystemPromptStream(
          messages,
          systemPrompt
        );

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.slice(6);
              try {
                const parsedData = JSON.parse(jsonStr);
                if (parsedData.choices && parsedData.choices[0].delta.content) {
                  const content = parsedData.choices[0].delta.content;
                  setProcessedPrompt((prev) => prev + content);
                }
              } catch (parseError) {
                console.error("Error parsing JSON:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing prompt:", error);
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [xAiApi]
  );

  const handleProcess = async () => {
    if (prompt.trim() === "") return;
    setIsLoading(true);
    setShowProcessedPrompt(true);
    try {
      const systemPrompt = `
        Your task is to transform the user's initial prompt into a detailed, formal specification for building a program or application. Do not build anything yourself. Instead, create a clear, structured set of instructions that another AI agent can follow to implement the project. Include:

        1. A brief overview of the project
        2. Detailed requirements and features
        3. Suggested file structure
        4. API endpoints (if applicable)
        5. Database schema (if applicable)
        6. Key functions or classes to implement
        7. Any specific libraries or tools to use

        Format your response as a markdown document with appropriate headers and code blocks where necessary. Be concise but thorough.
      `;
      await processWithXAi(prompt, systemPrompt);
    } catch (error) {
      console.error("Error processing prompt:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuild = useCallback(() => {
    if (!processedPrompt) return;

    const encodedPrompt = encodeURIComponent(processedPrompt);
    if (buildTarget === "agent") {
      console.log("Opening Replit tab with encoded prompt:", encodedPrompt);
      chrome.tabs.create(
        { url: `https://replit.com/new/nix?tab=ai&prompt=${encodedPrompt}` },
        (tab) => {
          if (tab.id) {
            console.log("Tab created with ID:", tab.id);
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              console.log("Tab updated event:", tabId, info.status);
              if (tabId === tab.id && info.status === "complete") {
                console.log(
                  "Sending clickStartBuilding message to tab:",
                  tabId
                );
                chrome.tabs.sendMessage(
                  tabId,
                  {
                    action: "clickStartBuilding",
                  },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      console.error(
                        "Error sending message:",
                        chrome.runtime.lastError
                      );
                    } else {
                      console.log(
                        "Message sent successfully, response:",
                        response
                      );
                    }
                  }
                );
                chrome.tabs.onUpdated.removeListener(listener);
              }
            });
          } else {
            console.error("Failed to create tab");
          }
        }
      );
    } else if (buildTarget === "v0") {
      window.open(`https://v0.dev/chat?q=${encodedPrompt}`, "_blank");
    }
  }, [processedPrompt, buildTarget]);

  useEffect(() => {
    if (buildTarget) {
      handleBuild();
      setBuildTarget(null);
    }
  }, [buildTarget, handleBuild]);

  useEffect(() => {
    if (processedPromptRef.current) {
      processedPromptRef.current.scrollTop =
        processedPromptRef.current.scrollHeight;
    }
  }, [processedPrompt]);

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex-grow overflow-hidden flex flex-col space-y-4">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your agent prompt here..."
          className="w-full h-1/3 resize-none p-4 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
        />
        {showProcessedPrompt && (
          <div
            ref={processedPromptRef}
            className="w-full h-2/3 overflow-auto p-4 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <div className="prose dark:prose-invert max-w-none text-left">
              <ReactMarkdown>{processedPrompt}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <div className="flex space-x-4">
          {!showProcessedPrompt && (
            <Button
              onClick={handleProcess}
              disabled={prompt.trim() === "" || isLoading || isStreaming}
              className={cn(
                "flex-grow py-3 text-lg font-semibold transition-all duration-200",
                prompt.trim() === "" || isLoading || isStreaming
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 dark:hover:bg-blue-500"
              )}
            >
              {isStreaming ? "Processing..." : "Process Prompt"}
            </Button>
          )}
          {showProcessedPrompt && !isStreaming && (
            <>
              <Button
                onClick={() => setBuildTarget("agent")}
                disabled={!processedPrompt || isLoading}
                className={cn(
                  "flex-grow py-3 text-lg font-semibold transition-all duration-200",
                  !processedPrompt || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-green-600 dark:hover:bg-green-500"
                )}
              >
                Build with Agent
              </Button>
              <Button
                onClick={() => setBuildTarget("v0")}
                disabled={!processedPrompt || isLoading}
                className={cn(
                  "flex-grow py-3 text-lg font-semibold transition-all duration-200",
                  !processedPrompt || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-purple-600 dark:hover:bg-purple-500"
                )}
              >
                Build with v0
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
