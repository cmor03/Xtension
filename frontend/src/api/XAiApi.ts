interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
}

export default class XAiApi {
  private apiKey: string;
  private defaultModel: string = "grok-preview";
  private defaultTemperature: number = 0.7;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(
    messages: Message[],
    options: ChatOptions,
    stream: boolean
  ): Promise<Response> {
    const { model = this.defaultModel, temperature = this.defaultTemperature } =
      options;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async sendMessageStream(
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await this.makeRequest(messages, options, true);
    return response.body!;
  }

  async sendMessage(
    messages: Message[],
    options: ChatOptions = {}
  ): Promise<any> {
    const response = await this.makeRequest(messages, options, false);
    return response.json();
  }

  async sendMessageWithSystemPrompt(
    messages: Message[],
    systemPrompt: string,
    options: ChatOptions = {}
  ): Promise<any> {
    let finalMessages = messages;

    if (messages.length === 0 || messages[0].role !== "system") {
      finalMessages = [{ role: "system", content: systemPrompt }, ...messages];
    }

    return this.sendMessage(finalMessages, options);
  }

  async sendMessageWithSystemPromptStream(
    messages: Message[],
    systemPrompt: string,
    options: ChatOptions = {}
  ): Promise<ReadableStream<Uint8Array>> {
    let finalMessages = messages;

    if (messages.length === 0 || messages[0].role !== "system") {
      finalMessages = [{ role: "system", content: systemPrompt }, ...messages];
    }

    return this.sendMessageStream(finalMessages, options);
  }

  setDefaultModel(model: string) {
    this.defaultModel = model;
  }

  setDefaultTemperature(temperature: number) {
    this.defaultTemperature = temperature;
  }
}
