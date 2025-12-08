import { OpenRouter } from "@openrouter/sdk";
import type { AnalysisResult } from "../types";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function analyzeWithLLM(text: string): Promise<AnalysisResult> {
  const prompt = `
You are an AI that analyzes documents.

Given the text below, return ONLY valid JSON (no markdown, no code blocks, just the raw JSON):
{
  "summary": "...",
  "type": "invoice | letter | cv | report",
  "metadata": {
    "date": "...",
    "sender": "...",
    "total_amount": "...",
    "other": "..."
  }
}

IMPORTANT: Always classify the document as one of the four types (invoice, letter, cv, or report or the type of document). Choose the most appropriate type based on the document content.
and also for the metadata return null or the correct values, if the type is (invoice, letter, cv, or report) none of the metadata should be empty

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

  let jsonString = content.trim();
  
  const codeBlockRegex = /^```(?:json)?\s*\n([\s\S]*?)\n```$/;
  const match = jsonString.match(codeBlockRegex);
  if (match) {
    jsonString = match[1].trim();
  }
  
  if (!jsonString.startsWith('{') && !jsonString.startsWith('[')) {
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
  }

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error("Failed to parse LLM response as JSON:", jsonString);
    throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
  }
}