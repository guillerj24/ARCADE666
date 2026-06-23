import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in process.env');
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  console.log('Sending a tiny grounding request to Gemini...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Search the web for the public Gemini shared chat at: https://gemini.google.com/share/3e054555fdc4 and tell me what exact user prompt, chat text, or code was shared in that conversation. What application did the user build?',
      config: {
        tools: [
          {
            googleSearch: {}
          }
        ]
      }
    });

    console.log('\n===================================');
    console.log('Gemini Grounded Response:');
    console.log('===================================');
    console.log(response.text);
    fs.writeFileSync('grounded_response.txt', response.text || '');
  } catch (err) {
    console.error('Error during grounding request:', err);
  }
}

run();
