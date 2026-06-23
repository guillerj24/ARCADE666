import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function testModel(modelName: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
  
  console.log(`Testing model: ${modelName}...`);
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: 'Respond with "success from ' + modelName + '" if you receive this.'
    });
    console.log(`[${modelName}] Success:`, res.text);
    return true;
  } catch (err: any) {
    console.error(`[${modelName}] Error:`, err.message || err);
    return false;
  }
}

async function run() {
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) break;
  }
}

run();
