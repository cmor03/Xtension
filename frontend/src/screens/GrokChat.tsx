import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useXAiApi } from "@/hooks/useXAi";
import { useAppUser, useAppWebpageContent } from "@/hooks/useApp";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface WebpageComponent {
  name: string;
  content: string;
  isIncluded: boolean;
}

export default function GrokChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [webpageComponents, setWebpageComponents] = useState<
    WebpageComponent[]
  >([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const xAiApi = useXAiApi();
  const webpageContent = useAppWebpageContent();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [parsingStatus, setParsingStatus] = useState<string>("");
  const [buildingStatus, setBuildingStatus] = useState<string>("");
  const [isBuildingAgent, setIsBuildingAgent] = useState(false);
  const [buildProgress, setBuildProgress] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const currentUser = useAppUser();

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const parseWebpageContent = async () => {
    if (!xAiApi || !webpageContent) {
      console.error("xAiApi or webpageContent is missing");
      setError("API or webpage content is unavailable");
      return;
    }
    setIsParsing(true);
    setShowComponents(true);
    setParsingStatus("Initializing parser...");
    try {
      console.log("Starting to parse webpage content");
      console.log("Webpage content length:", webpageContent.length);

      const systemPrompt = `
        Analyze the following webpage content and extract the most relevant components. Focus on the main content of the page, ignoring:
        1. Browser extensions (e.g., DarkReader)
        2. Navigation menus
        3. Footers
        4. Ads or sponsored content
        5. Scripts and style tags
        6. Meta tags and other non-visible elements

        For each relevant component:
        1. Provide a descriptive name
        2. Include the actual HTML content of that section

        Return the result as a JSON array of objects with "name" and "content" properties.
        The "content" property should contain the raw HTML of the extracted section.
        Limit the response to a maximum of 10 components, prioritizing the most important ones.
        Ensure the extracted components represent the core purpose and information of the webpage.
      `;
      console.log("System prompt:", systemPrompt);

      setParsingStatus("Analyzing webpage content...");
      const response = await xAiApi.sendMessage([
        { role: "system", content: systemPrompt },
        { role: "user", content: webpageContent.substring(0, 8000) },
      ]);

      console.log("API response status:", response.status);
      console.log("API response headers:", response.headers);

      setParsingStatus("Processing API response...");
      if (
        response.choices &&
        response.choices.length > 0 &&
        response.choices[0].message
      ) {
        const content = response.choices[0].message.content;
        console.log("Response content:", content);

        try {
          const jsonString = content.match(/```json\n([\s\S]*?)\n```/)[1];
          const parsedJson = JSON.parse(jsonString);
          console.log("Parsed JSON:", parsedJson);

          setParsingStatus("Extracting components...");
          const parsedComponents: WebpageComponent[] = parsedJson.map(
            (comp: { name: string; content: string }) => ({
              ...comp,
              isIncluded: false,
            })
          );
          console.log("Parsed components:", parsedComponents);

          setParsingStatus("Finalizing results...");
          setWebpageComponents(parsedComponents);
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError);
          setError("Failed to parse API response as JSON");
        }
      } else {
        console.error("Unexpected API response structure:", response);
        setError("Unexpected API response structure");
      }
    } catch (error) {
      console.error("Error parsing webpage content:", error);
      setError(`Failed to parse webpage content: ${error.message}`);
    } finally {
      setIsParsing(false);
      setParsingStatus("");
    }
  };

  const toggleComponent = (index: number) => {
    setWebpageComponents((prev) =>
      prev.map((comp, i) =>
        i === index ? { ...comp, isIncluded: !comp.isIncluded } : comp
      )
    );
  };

  const handleParseWebpage = () => {
    setHasInteracted(true);
    parseWebpageContent();
  };

  const handleSend = async (isBuildRequest: boolean = false) => {
    if (input.trim() === "" || isStreaming || !xAiApi) return;
    setHasInteracted(true);
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    if (isBuildRequest) {
      setBuildingStatus("Preparing build request...");
      setIsBuildingAgent(true);
      setShowComponents(false); // Hide components when building starts
    }

    try {
      let stream;
      if (isBuildRequest) {
        console.log("Preparing build request...");
        const systemPrompt = `
          Your task is to transform the user's chat history and final prompt into a detailed, formal specification for building a flask and vanilla javascript program or application. Do not build anything yourself. Instead, create a clear, structured set of instructions that another AI agent can follow to implement the project. Include:

          1. A brief overview of the project
          2. Detailed requirements and features
          3. Suggested file structure
          4. API endpoints (if applicable)
          5. Database schema (if applicable)
          6. Key functions or classes to implement
          7. Any specific libraries or tools to use

          Format your response as a markdown document with appropriate headers and code blocks where necessary. Be concise but thorough. Start your respone with a ### Project Overview header and continue from there, do not preface your response with anything just start the structured response.
        `;
        console.log("System prompt for build request:", systemPrompt);
        setBuildingStatus("Generating project specification...");
        stream = await xAiApi.sendMessageWithSystemPromptStream(
          newMessages,
          systemPrompt
        );
        console.log("Build request stream created:", stream);
      } else {
        const includedComponents = webpageComponents
          .filter((comp) => comp.isIncluded)
          .map((comp) => `${comp.name}: ${comp.content}`)
          .join("\n\n");

        const messagesWithComponents: Message[] = includedComponents
          ? [
              ...newMessages,
              {
                role: "system",
                content: `Webpage components:\n${includedComponents}`,
              },
            ]
          : newMessages;

        stream = await xAiApi.sendMessageStream(messagesWithComponents);
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
        setBuildingStatus("Finalizing project plan...");
        console.log("Build request completed. Setting buildTarget to 'agent'");
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
    } finally {
      setIsStreaming(false);
      if (!isBuildRequest) {
        setBuildingStatus("");
        setIsBuildingAgent(false);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleBuild = useCallback(async () => {
    if (!xAiApi) {
      setError("API is not available");
      return;
    }

    setHasInteracted(true);
    setIsStreaming(true);
    setBuildingStatus("Preparing build request...");
    setIsBuildingAgent(true);
    setShowComponents(false);
    setBuildProgress([]);

    try {
      console.log("Preparing build request...");
      const baseSystemPrompt = `
        Your task is to create a detailed, formal specification for building a Flask and vanilla JavaScript application that replicates the functionality of the provided webpage or components. Include:

        1. A brief overview of the project
        2. Detailed requirements and features based on the provided content
        3. Suggested file structure for a Flask application
        4. API endpoints to support the functionality
        5. Database schema (if applicable)
        6. Key functions or classes to implement
        7. Any specific libraries or tools to use

        Additionally, include instructions to add a footer to the page with a "Tip me at ⚡ ${currentUser?.name}@repl-ex.com" section.

        Format your response as a markdown document with appropriate headers and code blocks where necessary. Be concise but thorough. Start your response with a ### Project Overview header and continue from there, do not preface your response with anything just start the structured response.
      `;

      let content;
      let systemPrompt = baseSystemPrompt;

      const includedComponents = webpageComponents
        .filter((comp) => comp.isIncluded)
        .map((comp) => `${comp.name}: ${comp.content}`)
        .join("\n\n");

      if (messages.length > 0) {
        const userInstructions = messages[messages.length - 1].content;
        systemPrompt += `\n\nAdditional user instructions: ${userInstructions}`;
        content =
          includedComponents ||
          webpageContent ||
          "No webpage content available";
      } else if (includedComponents) {
        content = includedComponents;
        systemPrompt +=
          "\n\nFocus on creating an app that replicates the functionality of the selected components.";
      } else {
        content = webpageContent || "No webpage content available";
        systemPrompt +=
          "\n\nCreate an app that replicates the full functionality of the provided webpage.";
      }

      console.log("System prompt for build request:", systemPrompt);
      console.log("Content length:", content.length);

      if (content.length > 8000) {
        content = content.substring(0, 8000) + "... (truncated)";
        console.log("Content truncated to 8000 characters");
      }

      setBuildProgress(["Planning project specification..."]);
      const stream = await xAiApi.sendMessageWithSystemPromptStream(
        [{ role: "user", content }],
        systemPrompt
      );

      if (!stream) throw new Error("No stream returned");

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // Simulated progress steps
      const progressSteps = [
        "Analyzing requirements...",
        "Designing file structure...",
        "Defining API endpoints...",
        "Creating database schema...",
        "Outlining key functions...",
        "Selecting libraries and tools...",
        "Finalizing project plan...",
      ];

      let stepIndex = 0;
      const updateProgress = () => {
        if (stepIndex < progressSteps.length) {
          setCurrentStep(progressSteps[stepIndex]);
          stepIndex++;
          setTimeout(updateProgress, 3000);
        } else {
          setCurrentStep("Finishing up... aaaaaaaand....");
        }
      };

      updateProgress();

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
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }

      setBuildProgress((prev) => [...prev, "Project plan complete!"]);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: assistantMessage },
      ]);
      scrollToBottom();

      console.log("Build request completed");

      // Trim the encoded prompt to fit within the maximum URI size
      const maxUriLength = 20000;
      let encodedPrompt = encodeURIComponent(assistantMessage);
      if (encodedPrompt.length > maxUriLength) {
        const trimmedAssistantMessage = assistantMessage.slice(
          0,
          Math.floor(maxUriLength / 2)
        );
        encodedPrompt = encodeURIComponent(trimmedAssistantMessage);
        console.log("Prompt trimmed to fit URI length limit");
      }
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
    } catch (error) {
      console.error("Error in handleBuild:", error);
      let errorMessage = `Failed to generate build specification: ${error.message}`;
      if (error.response) {
        errorMessage += ` (Status: ${error.response.status})`;
        console.error("Response data:", error.response.data);
      }
      setError(errorMessage);
    } finally {
      setIsStreaming(false);
      setIsBuildingAgent(false);
      setBuildingStatus("");
      setCurrentStep("");
    }
  }, [
    messages,
    webpageComponents,
    xAiApi,
    setError,
    setMessages,
    scrollToBottom,
    webpageContent,
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex-grow overflow-hidden flex flex-col">
        <div
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto px-4 py-6"
        >
          {!hasInteracted ? (
            <Card className="bg-gray-800 p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">
                Replit Agent X-tension w/Grok
              </h2>
              <p className="mb-4">Here's how to get started:</p>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>
                  Click "Parse Current Webpage for Context" to analyze the
                  current page.
                </li>
                <li>
                  Select which webpage components to include in your chat.
                </li>
                <li>
                  Type your message in the input box below and click "Chat" to
                  start a conversation.
                </li>
                <li>
                  Use the "Build It" button to generate a project specification
                  based on your chat. Anything built will have a "Tip me at ⚡ $
                  {currentUser?.name}@repl-ex.com" section in the footer for
                  lightning donations, which will pay directly to your repl-ex
                  Bitcoin wallet.
                </li>
              </ol>
              <p className="text-blue-400">
                Start chatting now to explore and create!
              </p>
            </Card>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex mb-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <Card
                  className={cn(
                    "p-3 max-w-[70%] text-left",
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-white"
                  )}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ ...props }) => <p className="mb-2" {...props} />,
                      pre: ({ ...props }) => (
                        <pre
                          className="bg-gray-700 text-white p-2 rounded"
                          {...props}
                        />
                      ),
                      code: ({ inline, ...props }) =>
                        inline ? (
                          <code
                            className="bg-gray-700 text-blue-300 px-1 rounded"
                            {...props}
                          />
                        ) : (
                          <code {...props} />
                        ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Card>
              </div>
            ))
          )}
        </div>
        {error && <div className="text-red-500 mb-2 px-4">Error: {error}</div>}
      </div>
      <Card className="p-4 bg-gray-800 border-t border-gray-700">
        {!isBuildingAgent ? (
          <>
            <div className="flex space-x-2 mb-4">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isStreaming}
                className="flex-grow bg-gray-700 text-white border-gray-600 focus:border-blue-500"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isStreaming}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isStreaming ? "Sending..." : "Chat"}
              </Button>
              <Button
                onClick={handleBuild}
                disabled={isStreaming}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Build It
              </Button>
            </div>
            {!showComponents && (
              <Button
                onClick={handleParseWebpage}
                disabled={isStreaming || isParsing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                variant="default"
              >
                Parse Current Webpage for Context
              </Button>
            )}
            {showComponents && (
              <div className="mt-4">
                {isParsing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{parsingStatus}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {webpageComponents.map((comp, index) => (
                      <div key={index} className="flex items-center">
                        <Checkbox
                          id={`component-${index}`}
                          checked={comp.isIncluded}
                          onCheckedChange={() => toggleComponent(index)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`component-${index}`}
                          className="text-sm"
                        >
                          {comp.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg font-semibold">{buildingStatus}</span>
            {buildProgress.map((step, index) => (
              <span key={index} className="text-sm text-gray-400">
                {step}
              </span>
            ))}
            {currentStep && (
              <span className="text-sm text-blue-400">{currentStep}</span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
