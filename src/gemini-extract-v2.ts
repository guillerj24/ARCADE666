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

  const html = fs.readFileSync('temp_response.html', 'utf-8');

  // Let's truncate the HTML if it's too long, but actually 750KB is fine.
  // To be safe, let's also pass a clear prompt and log the raw response.
  console.log('Sending HTML to Gemini...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          text: `We need to extract the user prompt and the assistant response from this HTML of a Gemini shared chat.
Please search the HTML for conversational messages or JSON containing the chat history and output the complete conversation text and code.

HTML:
${html.substring(0, 500000)}` // Send first 500k characters to avoid any payload limits
        }
      ],
    });

    console.log('Success! Writing full response.json...');
    fs.writeFileSync('response.json', JSON.stringify(response, null, 2));
    
    if (response.text) {
      console.log(`Extracted text length: ${response.text.length}`);
      fs.writeFileSync('extracted_text.txt', response.text);
    } else {
      console.log('No direct text field, let us check candidates...');
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        console.log('Content structure:', JSON.stringify(candidate.content, null, 2));
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
