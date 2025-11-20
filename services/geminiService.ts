import { GoogleGenAI } from "@google/genai";
import { AISummary, Priority } from "../types";

// Initialize Gemini client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Simulates the "Stage 2" of the RAG pipeline.
 * In a real app, the 'text' would come from the Vector DB (Astra) retrieval step.
 * Here, we pass the raw text to Gemini 2.5 Flash to get the structured JSON.
 */
export const generateRegulatorySummary = async (
  text: string, 
  regulator: string
): Promise<AISummary> => {
  try {
    const ai = getAiClient();
    
    // We specificy the exact format requested by the product manager
    const prompt = `
      You are a regulatory compliance expert. Summarize this ${regulator} circular for a compliance officer at an Indian NBFC.
      
      Analyze the following text carefully:
      "${text}"

      Return the response in strictly valid JSON format with the following schema. Do not include markdown code blocks (like \`\`\`json), just the raw JSON string.
      
      Schema:
      {
        "whatChanged": ["string", "string", "string"],
        "impactedDepartments": [
           {"name": "Credit Team", "impact": "description"}, 
           {"name": "Operations", "impact": "description"},
           {"name": "Legal", "impact": "description"}
        ],
        "deadline": "string (extract date or 'To be announced')",
        "priority": "High" | "Medium" | "Low"
      }

      Logic for Priority:
      - High if deadline < 30 days
      - Medium if 30-90 days
      - Low if > 90 days or undefined
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for factual extraction
      }
    });

    const resultText = response.text || "{}";
    
    // Clean up potential markdown formatting if the model adds it despite instructions
    const jsonString = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(jsonString);

    return {
      whatChanged: parsed.whatChanged || [],
      impactedDepartments: parsed.impactedDepartments || [],
      deadline: parsed.deadline || "To be announced",
      priority: parsed.priority as Priority || Priority.MEDIUM,
      rawOutput: resultText
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback mock data in case of API failure or empty key
    return {
      whatChanged: ["Unable to generate summary. Please check API Key.", "Error retrieving regulatory context."],
      impactedDepartments: [],
      deadline: "Unknown",
      priority: Priority.LOW,
      rawOutput: "Error processing request."
    };
  }
};

/**
 * Helper to generate tasks from summary items
 */
export const generateSuggestedTasks = async (summary: AISummary): Promise<Array<{title: string, department: string}>> => {
  const ai = getAiClient();
  const prompt = `
    Based on the following regulatory changes, suggest 3 specific, actionable tasks for an NBFC Compliance team.
    
    Changes: ${JSON.stringify(summary.whatChanged)}
    Impacts: ${JSON.stringify(summary.impactedDepartments)}

    Return strictly valid JSON:
    [
      {"title": "Task title", "department": "Recommended Department"}
    ]
  `;

   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const jsonString = (response.text || "[]").replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
   } catch (e) {
     return [];
   }
};