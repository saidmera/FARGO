
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLogisticsAdvice = async (itemType: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 short, practical tips for transporting: ${itemType}. Format as a JSON object with a 'tips' array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["tips"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"tips": []}');
    return data.tips as string[];
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return ["Ensure item is secured", "Check dimensions before loading", "Use protective padding"];
  }
};
