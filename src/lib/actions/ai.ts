'use server'

import { GoogleGenAI } from '@google/genai';

const draftCache = new Map<string, string>();

export async function draftOutreachMessage(buyerName: string, materialName: string, quantity: number, companyName: string = 'Our Company') {
  const cacheKey = `${buyerName}_${materialName}_${quantity}_${companyName}`;
  if (draftCache.has(cacheKey)) {
    return draftCache.get(cacheKey)!;
  }

  const fallbackTemplate = `Subject: Supplying ${quantity.toLocaleString()} KG of ${materialName} for ${buyerName}\n\nHi ${buyerName} team,\n\nWe noticed you are actively sourcing ${materialName}. We currently have ${quantity.toLocaleString()} KG available at our facility that meets your technical and quality specifications.\n\nCould we arrange a brief call to finalize pricing and scheduled logistics dispatch?\n\nBest regards,\n${companyName} Supply Team`;

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    draftCache.set(cacheKey, fallbackTemplate);
    return fallbackTemplate;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Write a professional and concise B2B outreach email.
      
      Sender Company: ${companyName}
      Recipient Buyer: ${buyerName}
      Material Offered: ${quantity} KG of ${materialName}
      
      Goal: Propose a supply partnership for this specific material. Be persuasive but brief. Do not use placeholders like [Your Name].
    `;

    const aiPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI draft timeout")), 2000)
    );

    const response = await Promise.race([aiPromise, timeoutPromise]);
    const text = response.text || fallbackTemplate;
    draftCache.set(cacheKey, text);
    return text;
  } catch (error: any) {
    draftCache.set(cacheKey, fallbackTemplate);
    return fallbackTemplate;
  }
}
