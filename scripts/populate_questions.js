import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateQuestions() {
    console.log("Generating questions using Gemini API...");
    
    const prompt = `
Generate 15 trivia questions for a game.
Categories must be chosen from: History, Technology, Sports, Culture, Connect.
Difficulties: Purple (hard, 15 points), Orange (medium, 9 points), Yellow (easy, 3 points). Ensure an even mix.
Each question should be returned in a strict JSON array format matching this schema:
[
  {
    "category": "Culture",
    "difficulty": "Orange",
    "question": "Which famous artist...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0, // integer index of the correct option (0-3)
    "source": "GeminiAPI"
  }
]
Please output ONLY valid JSON.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        const text = response.text;
        const questions = JSON.parse(text);
        return questions;
    } catch (e) {
        console.error("Failed to generate questions:", e);
        return [];
    }
}

async function main() {
    try {
        console.log("Starting Question Population Script...");

        const newQuestions = await generateQuestions();
        if (newQuestions.length === 0) {
            console.warn("No questions generated, exiting.");
            process.exit(1);
        }

        console.log(`Generated ${newQuestions.length} questions. Inserting...`);

        // Insert into Supabase
        const { data, error } = await supabase
            .from('questions')
            .insert(newQuestions)
            .select();

        if (error) throw error;

        console.log(`Successfully inserted ${data.length} questions.`);

    } catch (err) {
        console.error("Script failed:", err);
        process.exit(1);
    }
}

main();
