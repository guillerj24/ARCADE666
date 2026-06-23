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

  console.log('Sending request using gemini-3.1-flash-lite with Google Search Grounding...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'We need to clone and improve the application at this public Gemini share link: https://gemini.google.com/share/3e054555fdc4. Please use Google Search grounding to search for or fetch the contents of this share link, and describe in detail what application, game, or tool is built there. Output the user prompt, the assistant responses, and any source code provided.',
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
    console.error('Error:', err);
  }
}

run();
