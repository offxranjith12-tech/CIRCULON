'use server';

import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const CIRCULON_SYSTEM_KNOWLEDGE = `
You are the official AI Assistant for CIRCULON (circulon.ai) — India's leading AI-powered Industrial Waste-to-Buyer Intelligence Platform.
Your mission is to help visitors, factory owners, procurement managers, and recyclers understand CIRCULON, explore its features, and navigate the platform.

Here is complete knowledge about CIRCULON:

1. CORE PURPOSE:
- Tagline: "Don't recycle everything. Find who already needs it."
- Instead of downcycling materials or paying high disposal fees to unverified scrap dealers, CIRCULON connects industrial scrap generators directly with commercial manufacturers who actively need those exact by-products as raw feedstocks.

2. CORE FEATURES & CAPABILITIES:
- Feature 1: AI Material Diagnostics (Google Gemini 2.5 Flash)
  * Analyzes scrap photos and specifications.
  * Standardizes material names, grades, and quality conditions.
  * Identifies non-obvious secondary industries and high-value reuse applications in under 60 seconds.
- Feature 2: Smart Buyer Matching & Opportunity Scoring (0–100)
  * Evaluates material compatibility against verified buyer specifications.
  * Factors in buyer demand tier, required batch volumes, and offer prices.
- Feature 3: Freight Logistics Cost Engine (₹35 / KM)
  * Automatically models transport transit costs based on delivery distance.
  * Deducts logistics upfront so sellers see real Projected Net Profit before making deals.
- Feature 4: Automated B2B Outreach Generator
  * Generates professional, customized partnership proposals and letters of intent with one click.
- Feature 5: Enterprise Verification & Admin Approval
  * To prevent fraud and middlemen, every registering company must provide physical address and business ID proof (GSTIN, PAN, or CIN).
  * An administrator reviews documents in the Admin Portal before accounts can log in.
- Feature 6: Seller Portal & Buyer Portal
  * Seller Portal: List waste, upload photos, manage inventory, view opportunity scores and analytics.
  * Buyer Portal: View incoming connection requests, inspect seller batches, accept or decline deals.
- Feature 7: Interactive Scrap ROI Calculator
  * Live calculator on the home page allowing visitors to calculate gross value, freight deductions, and net return without logging in.

3. SUPPORTED MATERIAL STREAMS & BENCHMARK RATES:
- 🧵 Textiles & Apparel Scrap (Cotton comber, clips, yarn waste): ₹25 – ₹48 / KG
- 🧴 Polymers & Plastics (HDPE drums, PET flakes, LDPE film): ₹20 – ₹42 / KG
- ⚙️ Foundry & Metallurgy (Aluminium turnings, copper scrap, mild steel): ₹65 – ₹220 / KG
- 📦 Paper & Corrugated Packaging (OCC bales, Kraft paper): ₹12 – ₹22 / KG
- 🧱 Minerals & By-Products (Fly ash, foundry sand, blast furnace slag): ₹6 – ₹18 / KG

4. COMPLIANCE & ESG:
- Aligned with Central Pollution Control Board (CPCB) guidelines.
- Compliant with ISO 14001 Environmental Management Systems.
- Generates transparent digital audit trails for corporate Business Responsibility and Sustainability Reporting (BRSR).

EXAMPLE QUESTIONS AND HOW YOU SHOULD ANSWER THEM:
Q: "What are the waste you take?" or "What scrap do you support?"
A: "CIRCULON supports five major industrial streams:
- 🧵 Textiles: Cotton comber, yarn waste, fabric offcuts (₹25–₹48/KG)
- 🧴 Plastics & Polymers: HDPE drums, PET regrind, LDPE film (₹20–₹42/KG)
- ⚙️ Metallurgy: Aluminium turnings, copper scraps (₹65–₹220/KG)
- 📦 Paper & Packaging: OCC cardboard bales, Kraft rolls (₹12–₹22/KG)
- 🧱 Minerals: Fly ash, furnace slag (₹6–₹18/KG)"

Q: "What are the users you have in this website?" or "What are the dashboard options for each user?"
A: "CIRCULON provides customized dashboards for three types of users:
1. **Waste Sellers (Generators)**: 
   - *Dashboard Options*: List new waste inventory, upload scrap photos for AI analysis, view Opportunity Scores, manage live listings, and track net profits.
2. **Material Buyers (Recyclers)**: 
   - *Dashboard Options*: Browse verified scrap listings, filter by material stream, review AI quality scores, and send connection requests/purchase proposals.
3. **Administrators**: 
   - *Dashboard Options*: Review new company registrations, verify physical addresses and business IDs (GSTIN/PAN), approve/reject accounts, and monitor platform metrics to ensure a fraud-free ecosystem."

Q: "Explain each option in the side nav bar" or "What is in the sidebar?"
A: "The side navigation menu options change based on your role:
**Waste Sellers**:
- **Dashboard**: High-level overview and metrics.
- **My Waste**: Manage your currently listed scrap inventory.
- **Add Waste**: Upload new materials with AI diagnostics.
- **Manage Buyers**: View connection requests and proposals.
- **Settings**: Update company profile and preferences.

**Material Buyers**:
- **Dashboard**: High-level overview of purchasing metrics.
- **Incoming Requests**: View proposals sent by waste sellers.
- **Waste Marketplace**: Browse available scrap matching your needs.
- **Settings**: Update purchasing requirements and profile.

**Administrators**:
- **Verification Portal**: Review and approve new company registrations.
- **Seller & Buyer Portal View**: Monitor platform activity.
- **Settings**: Platform-wide configuration."

Q: "How do I calculate price?" or "What is my scrap worth?"
A: "You can calculate your scrap value instantly using our **Scrap Calculator** right on the home page! It factors in your material rate, subtracts transit distance at **₹35 per KM**, and gives you an **Opportunity Score (0–100)** with an estimated net profit."

Q: "How does the buyer matching work?"
A: "When you submit your scrap details, CIRCULON scans our verified buyer database. It calculates an **Opportunity Score** considering price, distance, and quantity. You can then send a direct connection request with an **AI-drafted proposal** to finalize purchase orders!"

GUIDELINES FOR YOUR RESPONSES:
- Be concise, professional, warm, and highly informative.
- Highlight relevant features when asked.
- Provide direct navigation tips (e.g. "Click 'Scrap Calculator' in the top bar" or "Go to 'List Waste' to add your material").
- Use bullet points and clean formatting.
`;

// Smart local fallback response engine when GEMINI_API_KEY is not set or request fails
function getLocalSmartResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes('feature') || q.includes('what can') || q.includes('capabilities') || q.includes('do')) {
    return `CIRCULON offers 7 core features for industrial circular commerce:
1. **AI Material Diagnostics (Gemini 2.5)**: Instant classification of scrap into standard grades and secondary reuse cases.
2. **Smart Buyer Matching**: Algorithmic scoring (0–100) based on buyer demand and compatibility.
3. **Logistics Cost Engine**: Real-time freight deduction at ₹35/km for transparent net margins.
4. **Automated B2B Proposals**: One-click AI-drafted business outreach proposals.
5. **Interactive Scrap Calculator**: Estimate your gross and net profits without logging in.
6. **Enterprise Verification**: Admin address and ID proof verification to protect all transactions.
7. **Dual Portals**: Dedicated portals for industrial Waste Sellers and Material Buyers.`;
  }

  if (q.includes('calculator') || q.includes('price') || q.includes('rate') || q.includes('worth') || q.includes('cost')) {
    return `You can calculate your scrap value instantly using our **Scrap Calculator** right on the home page!
- Factors in your material rate (e.g., Cotton comber at ₹38/kg, Aluminium at ₹115/kg).
- Automatically subtracts transit distance at **₹35 per KM**.
- Gives you an **Opportunity Score (0–100)** and estimated net profit before you list!`;
  }

  if (q.includes('buyer') || q.includes('match') || q.includes('sell')) {
    return `CIRCULON connects you directly with verified commercial buyers who purchase secondary materials as raw inputs.
- When you submit your scrap details, the platform scans our verified buyer database.
- It calculates an **Opportunity Score** considering price, distance, and quantity.
- You can send a direct connection request with an **AI-drafted proposal** to finalize purchase orders!`;
  }

  if (q.includes('approve') || q.includes('admin') || q.includes('register') || q.includes('login') || q.includes('signup') || q.includes('account')) {
    return `To ensure trust and eliminate unverified middlemen:
1. When you register at **/login**, provide your company name, physical address, and business ID proof (GSTIN, PAN, or CIN).
2. The registration is submitted to the **Admin** for review.
3. Once approved, you will receive a confirmation email and your account is unlocked to log in!`;
  }

  if (q.includes('user') || q.includes('who') || q.includes('people') || q.includes('role') || q.includes('dashboard') || q.includes('option')) {
    return `CIRCULON provides customized dashboards for each type of user:
1. **Waste Sellers (Generators)**: 
   - **Dashboard Options**: List new waste inventory, upload scrap photos for AI analysis, view Opportunity Scores, manage live listings, and track net profits.
2. **Material Buyers (Recyclers)**: 
   - **Dashboard Options**: Browse verified scrap listings, filter by material stream, review AI quality scores, and send connection requests/purchase proposals.
3. **Administrators**: 
   - **Dashboard Options**: Review new company registrations, verify physical addresses and business IDs (GSTIN/PAN), approve/reject accounts, and monitor platform metrics to ensure a fraud-free ecosystem.`;
  }

  if (q.includes('sidebar') || q.includes('menu') || q.includes('navigation') || q.includes('nav')) {
    return `The side navigation menu gives you access to the following areas depending on your role:

**Waste Sellers**:
- **Dashboard**: High-level overview and metrics.
- **My Waste**: Manage your currently listed scrap inventory.
- **Add Waste**: Upload new materials with AI diagnostics.
- **Manage Buyers**: View connection requests and proposals.
- **Settings**: Update company profile and preferences.

**Material Buyers**:
- **Dashboard**: High-level overview of purchasing metrics.
- **Incoming Requests**: View proposals sent by waste sellers.
- **Waste Marketplace**: Browse available scrap matching your needs.
- **Settings**: Update purchasing requirements and profile.

**Administrators**:
- **Verification Portal**: Review and approve new company registrations.
- **Seller Portal View & Buyer Portal View**: Monitor platform activity.
- **Settings**: Platform-wide configuration.`;
  }

  if (q.includes('material') || q.includes('plastic') || q.includes('textile') || q.includes('cotton') || q.includes('metal') || q.includes('waste') || q.includes('scrap')) {
    return `CIRCULON supports five major industrial streams:
- 🧵 **Textiles**: Cotton comber, yarn waste, fabric offcuts (₹25–₹48/KG)
- 🧴 **Plastics & Polymers**: HDPE drums, PET regrind, LDPE film (₹20–₹42/KG)
- ⚙️ **Metallurgy**: Aluminium turnings, copper scraps (₹65–₹220/KG)
- 📦 **Paper & Packaging**: OCC cardboard bales, Kraft rolls (₹12–₹22/KG)
- 🧱 **Minerals**: Fly ash, furnace slag (₹6–₹18/KG)`;
  }

  return `CIRCULON is an AI-powered Waste-to-Buyer Circular Intelligence platform. It uses Google Gemini 2.5 Flash to categorize industrial scrap, match verified buyers, deduct freight at ₹35/km, and maximize net profit. 

You can ask me about:
- **Platform Features**
- **How Buyer Matching Works**
- **Supported Material Rates**
- **Company Registration & Approval Process**`;
}

export async function askCirculonAssistant(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) return "Please enter a question about CIRCULON.";

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return getLocalSmartResponse(trimmed);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format conversation history for context
    const conversationContext = history
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const prompt = `
${CIRCULON_SYSTEM_KNOWLEDGE}

Recent Conversation History:
${conversationContext}

User Query:
${trimmed}

CRITICAL INSTRUCTIONS:
1. Respond concisely, accurately, and helpfully as the CIRCULON AI assistant. Use markdown bullet points where appropriate.
2. If the user asks a question that is completely unrelated to CIRCULON, industrial waste, recycling, or the features mentioned above, DO NOT attempt to answer it. Instead, politely inform the user that you can only answer questions related to CIRCULON and its services.
3. NEVER provide random, out-of-context, or hallucinatory answers.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return response.text || getLocalSmartResponse(trimmed);
  } catch (error: any) {
    console.warn('Gemini chat API error, falling back to local engine:', error?.message || error);
    return getLocalSmartResponse(trimmed);
  }
}
