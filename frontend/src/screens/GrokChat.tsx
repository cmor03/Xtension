import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useXAiApi } from "@/hooks/useXAi";
import { FaRegHandPaper, FaHandRock } from "react-icons/fa";
import { useAppSetWebpageContent, useAppWebpageContent } from "@/hooks/useApp";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function GrokChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWebpageGrabbed, setIsWebpageGrabbed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const xAiApi = useXAiApi();
  const webpageContent = useAppWebpageContent();
  const setAppWebpageContent = useAppSetWebpageContent();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const grabWebpageContent = () => {
    console.log("Attempting to grab webpage content");
    setError(null); // Clear any previous errors
    chrome.runtime.sendMessage({ action: "getPageContent" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to background script:", chrome.runtime.lastError);
        setError("Failed to communicate with the extension. Please try reloading the page.");
      } else if (response && response.content) {
        console.log("Webpage content received:", response.content.substring(0, 100) + "...");
        setAppWebpageContent(response.content);
        setIsWebpageGrabbed(true);
      } else if (response && response.error) {
        console.error("Error getting page content:", response.error);
        setError(response.error);
      } else {
        console.error("Failed to receive content");
        setError("Failed to receive content from the page. Please try again.");
      }
    });
  };

  const toggleWebpageGrab = () => {
    if (isWebpageGrabbed) {
      console.log("Ungrabbing webpage content");
      setIsWebpageGrabbed(false);
      setAppWebpageContent("");
    } else {
      grabWebpageContent();
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" || isStreaming || !xAiApi) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: isWebpageGrabbed ? `Webpage content: ${webpageContent}\n${input}` : input },
    ];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const stream = await xAiApi.sendMessageStream(newMessages);
      if (!stream) throw new Error("No stream returned");

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices[0].delta.content) {
                assistantMessage += parsed.choices[0].delta.content;
                setMessages([
                  ...newMessages,
                  { role: "assistant", content: assistantMessage },
                ]);
                scrollToBottom();
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error calling xAI API:", error);
    } finally {
      setIsStreaming(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-hidden">
        <div ref={chatContainerRef} className="h-full overflow-y-auto px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex mb-4",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl max-w-[70%] text-left",
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                )}
                style={{ alignSelf: "flex-start" }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ ...props }) => (
                      <p className="mb-2" {...props} />
                    ),
                    pre: ({ ...props }) => (
                      <pre
                        className="bg-gray-800 text-white p-2 rounded"
                        {...props}
                      />
                    ),
                    code: ({ inline, ...props }) =>
                      inline ? (
                        <code
                          className="bg-gray-200 text-red-500 px-1 rounded"
                          {...props}
                        />
                      ) : (
                        <code {...props} />
                      ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
      {error && (
        <div className="text-red-500 mb-2 px-4">
          Error: {error}
        </div>
      )}
      <div className="mt-4">
        <div className="flex space-x-2 fixed bottom-0 left-0 right-0 p-4 bg-gray">
          <Button
            onClick={toggleWebpageGrab}
            disabled={isStreaming}
            className={cn(
              "p-2",
              isWebpageGrabbed ? "text-blue-500" : "text-gray-500"
            )}
            variant="outline"
          >
            {isWebpageGrabbed ? <FaHandRock /> : <FaRegHandPaper />}
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isStreaming}
            className="flex-grow"
          />
          <Button onClick={handleSend} disabled={isStreaming}>
            {isStreaming ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
