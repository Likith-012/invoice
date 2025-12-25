import { GoogleGenAI, Type } from "@google/genai";
import { LineItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const parseInvoiceItemsFromText = async (text: string): Promise<LineItem[]> => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found. Returning empty list.");
    return [];
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse the following text into a list of invoice line items. Return a JSON array. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER }
            },
            required: ["description", "quantity", "unitPrice"]
          }
        }
      }
    });

    const jsonStr = response.text || "[]";
    const parsed = JSON.parse(jsonStr);

    // Map to internal LineItem format
    return parsed.map((item: any) => ({
      id: uuidv4(),
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0
    }));

  } catch (error) {
    console.error("Error parsing invoice items with Gemini:", error);
    throw error;
  }
};