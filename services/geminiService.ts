import { GoogleGenAI, Type } from "@google/genai";
import { LineItem } from "../types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Fallback parser that uses Regular Expressions to extract items from text
 * when the AI service is unavailable.
 * Supports patterns:
 * 1. Description Quantity Price (e.g., "Web Design 10 500")
 * 2. Description Price (e.g., "Hosting 100") - defaults Qty to 1
 */
const parseWithRegex = (text: string): LineItem[] => {
  const items: LineItem[] = [];
  // Split by newlines or semicolons
  const lines = text.split(/\n|;/);

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    // Pattern 1: Description + Quantity + Price (e.g., "Apple 5 10")
    // Regex: Capture Text (group 1) + Space + Capture Int (group 2) + Space + Capture Number (group 3)
    const qtyPriceMatch = cleanLine.match(/^(.*)\s+(\d+)\s+(\d+(?:[\.,]\d+)?)$/);
    
    if (qtyPriceMatch) {
      items.push({
        id: uuidv4(),
        description: qtyPriceMatch[1].trim(),
        quantity: Number(qtyPriceMatch[2]),
        unitPrice: Number(qtyPriceMatch[3].replace(',', '.'))
      });
      continue;
    }

    // Pattern 2: Description + Price (e.g., "Hosting 100.00")
    // Regex: Capture Text (group 1) + Space + Capture Number (group 2)
    const priceMatch = cleanLine.match(/^(.*)\s+(\d+(?:[\.,]\d+)?)$/);

    if (priceMatch) {
      items.push({
        id: uuidv4(),
        description: priceMatch[1].trim(),
        quantity: 1,
        unitPrice: Number(priceMatch[2].replace(',', '.'))
      });
      continue;
    }
    
    // Pattern 3: Fallback - Treat entire line as description
    items.push({
        id: uuidv4(),
        description: cleanLine,
        quantity: 1,
        unitPrice: 0
    });
  }
  return items;
};

export const parseInvoiceItemsFromText = async (text: string): Promise<LineItem[]> => {
  // 1. If no API Key is found in the environment, skip AI and use Regex immediately.
  if (!process.env.API_KEY) {
    console.warn("API Key not found. Using local regex parser.");
    return parseWithRegex(text);
  }

  // 2. Try using the Gemini AI model
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
    const aiItems = parsed.map((item: any) => ({
      id: uuidv4(),
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0
    }));

    // If AI returned empty list but text wasn't empty, try regex fallback
    if (aiItems.length === 0 && text.trim().length > 0) {
      return parseWithRegex(text);
    }

    return aiItems;

  } catch (error) {
    console.warn("Error parsing invoice items with Gemini, falling back to regex:", error);
    // 3. Fallback to regex if AI fails (e.g. quota, network, or invalid key)
    return parseWithRegex(text);
  }
};