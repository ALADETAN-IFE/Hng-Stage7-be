import { OpenRouter } from "@openrouter/sdk";

// Initialize OpenRouter client
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function analyzeWithLLM(text: string) {
  const prompt = `
You are an AI that analyzes documents.

Given the text below, return in strict JSON:
{
  "summary": "...",
  "type": "invoice | letter | cv | report | unknown",
  "metadata": {
    "date": "...",
    "sender": "...",
    "total_amount": "...",
    "other": "..."
  }
}

TEXT:
${text}
`;

  const completion = await openRouter.chat.send({
    model: "openai/gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    stream: false,
  });

  const message = completion.choices[0]?.message;
  if (!message) {
    throw new Error("No message received from AI");
  }

  const content = typeof message.content === "string" 
    ? message.content 
    : JSON.stringify(message.content);

  return JSON.parse(content);
}