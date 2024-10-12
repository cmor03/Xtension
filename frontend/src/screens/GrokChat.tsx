import { useState, useRef, useEffect, useCallback } from "react";
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

export default function CombinedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWebpageGrabbed, setIsWebpageGrabbed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildTarget, setBuildTarget] = useState<"agent" | null>(null);
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
        console.error(
          "Error sending message to background script:",
          chrome.runtime.lastError
        );
        setError(
          "Failed to communicate with the extension. Please try reloading the page."
        );
      } else if (response && response.content) {
        console.log(
          "Webpage content received:",
          response.content.substring(0, 100) + "..."
        );
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

  const toggleWebpageGrab = useCallback(() => {
    const grabWebpageContent = () => {
      console.log("Attempting to grab webpage content");
      setError(null);
      chrome.runtime.sendMessage({ action: "getPageContent" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error sending message to background script:",
            chrome.runtime.lastError
          );
          setError(
            "Failed to communicate with the extension. Please try reloading the page."
          );
        } else if (response && response.content) {
          console.log(
            "Webpage content received:",
            response.content.substring(0, 100) + "..."
          );
          setAppWebpageContent(response.content);
          setIsWebpageGrabbed(true);
        } else if (response && response.error) {
          console.error("Error getting page content:", response.error);
          setError(response.error);
        } else {
          console.error("Failed to receive content");
          setError(
            "Failed to receive content from the page. Please try again."
          );
        }
      });
    };

    if (isWebpageGrabbed) {
      setAppWebpageContent(null);
      setIsWebpageGrabbed(false);
      setAppWebpageContent("");
    } else {
      grabWebpageContent();
    }
  }, [isWebpageGrabbed, setAppWebpageContent]);

  const handleSend = async (isBuildRequest: boolean = false) => {
    if (input.trim() === "" || isStreaming || !xAiApi) return;
    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: isWebpageGrabbed
          ? `Webpage content: ${webpageContent}\n${input}`
          : input,
      },
    ];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      let stream;
      if (isBuildRequest) {
        const systemPrompt = `
          Your task is to transform the user's chat history and final prompt into a detailed, formal specification for building a program or application. Do not build anything yourself. Instead, create a clear, structured set of instructions that another AI agent can follow to implement the project. Include:

          1. A brief overview of the project
          2. Detailed requirements and features
          3. Suggested file structure
          4. API endpoints (if applicable)
          5. Database schema (if applicable)
          6. Key functions or classes to implement
          7. Any specific libraries or tools to use

          Format your response as a markdown document with appropriate headers and code blocks where necessary. Be concise but thorough. Start your respone with a ### Project Overview header and continue from there, do not preface your response with anything just start the structured response.
        `;
        stream = await xAiApi.sendMessageWithSystemPromptStream(
          newMessages,
          systemPrompt
        );
      } else {
        stream = await xAiApi.sendMessageStream(newMessages);
      }

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

      if (isBuildRequest) {
        setBuildTarget("agent");
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

  const handleBuild = useCallback(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;

    const encodedPrompt = encodeURIComponent(lastMessage.content);
    console.log("Opening Replit tab with encoded prompt:", encodedPrompt);
    chrome.tabs.create(
      { url: `https://replit.com/new/nix?tab=ai&prompt=${encodedPrompt}` },
      (tab) => {
        if (tab.id) {
          console.log("Tab created with ID:", tab.id);
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            console.log("Tab updated event:", tabId, info.status);
            if (tabId === tab.id && info.status === "complete") {
              console.log("Sending clickStartBuilding message to tab:", tabId);
              chrome.tabs.sendMessage(
                tabId,
                { action: "clickStartBuilding" },
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
    setBuildTarget(null);
  }, [messages]);

  useEffect(() => {
    if (buildTarget === "agent") {
      handleBuild();
    }
  }, [buildTarget, handleBuild]);

  const handleSetInput = (value: string) => {
    if (webpageContent) {
      setInput(`Webpage content: ${webpageContent}\n${value}`);
    } else {
      setInput(value);
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
                    p: ({ ...props }) => <p className="mb-2" {...props} />,
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
      {error && <div className="text-red-500 mb-2 px-4">Error: {error}</div>}
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
            onChange={(e) => handleSetInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={isStreaming}
            className="flex-grow"
          />
          <Button onClick={() => handleSend()} disabled={isStreaming}>
            {isStreaming ? "Sending..." : "Chat"}
          </Button>
          <Button onClick={() => handleSend(true)} disabled={isStreaming}>
            {isStreaming ? "Processing..." : "Build It"}
          </Button>
        </div>
      </div>
    </div>
  );
}
