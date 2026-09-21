'use server'

import { GoogleGenAI } from '@google/genai';

export async function draftOutreachMessage(buyerName: string, materialName: string, quantity: number, companyName: string = 'Our Company') {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Subject: Supplying ${quantity} KG of ${materialName} for ${buyerName}\n\nHi ${buyerName} team,\n\nWe noticed you are sourcing ${materialName}. We currently have ${quantity} KG available that matches your industry requirements.\n\nCould we arrange a quick call to discuss pricing and logistics?\n\nBest regards,\n${companyName}`;
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Write a professional and concise B2B outreach email.
    
    Sender Company: ${companyName}
    Recipient Buyer: ${buyerName}
    Material Offered: ${quantity} KG of ${materialName}
    
    Goal: Propose a supply partnership for this specific material. Be persuasive but brief. Do not use placeholders like [Your Name].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return response.text || "Failed to generate message.";
  } catch (error: any) {
    console.error("AI Outreach Failed with real API. Falling back to mock message.", error?.message || error);
    return `[Mock AI Outline]\nSubject: Supplying ${quantity} KG of ${materialName} for ${buyerName}\n\nHi ${buyerName} team,\n\nWe noticed you are sourcing ${materialName}. We currently have ${quantity} KG available that matches your industry requirements.\n\nCould we arrange a quick call to discuss pricing and logistics?\n\nBest regards,\n${companyName}`;
  }
}
