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

  console.log('Reading temp_response.html...');
  const html = fs.readFileSync('temp_response.html', 'utf-8');

  // Let's send the first 400KB of HTML to gemini-3.1-flash-lite
  console.log('Sending HTML to gemini-3.1-flash-lite to extract the conversation...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        {
          text: `You are an expert developer. The following is the raw HTML of a Google Gemini shared chat conversation.
We need to extract the actual conversation messages (user prompt and Gemini response).
Please find the conversation, identify what game/app is being described, and output the user prompt and the code fully.

If you don't find the conversation or code, describe what you see in the HTML, especially any keys, variables, or structures that might contain the data.

HTML (first 400k chars):
${html.substring(0, 400000)}`
        }
      ],
    });

    console.log('Gemini extraction complete!');
    console.log('Writing output to extracted_conversation.md...');
    fs.writeFileSync('extracted_conversation.md', response.text || '');
    console.log('Extracted conversation saved to extracted_conversation.md');
    console.log('\nResponse preview:');
    console.log(response.text?.substring(0, 1000));
  } catch (err) {
    console.error('Error during Gemini extraction:', err);
  }
}

run();
