import { GoogleGenAI, Type } from "@google/genai";
import { OptimizationRequest, OptimizationResult } from '../types';

export const optimizeResume = async (data: OptimizationRequest): Promise<OptimizationResult> => {
  // Use VITE_ prefix for client-side environment variables, fallback for safety
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("DEBUG: ENV DUMP", {
      VITE_KEY: !!import.meta.env.VITE_GEMINI_API_KEY,
      PROCESS_KEY: !!process.env.GEMINI_API_KEY
    });
    throw new Error(
      "API Key is missing.\n" +
      "- LOCALHOST: Stop the server (Ctrl+C) and run 'npm run dev' again to load the .env file.\n" +
      "- VERCEL: Go to Project Settings > Environment Variables and add VITE_GEMINI_API_KEY."
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an expert Resume Writer and Career Coach specialized in ATS optimization.
  
  CRITICAL FORMATTING RULES:
  1. **NO PROFESSIONAL SUMMARY**: Do not include a profile summary or objective statement. Start directly with Professional Experience or Skills.
  2. **Experience Headers**: You MUST use this exact format:
     ### Job Title, Company Name | Date Range
  3. **Consistent Layout**: Use standard Markdown (bullet points, bolding).
  4. **Highlighting**: For every "change" you list in the analysis, you must provide the *exact* text snippet (quote) from the *rewritten* resume so it can be highlighted programmatically.
  
  TASK:
  1. Analyze the Job Description (JD).
  2. Rewrite the Resume to target the JD.
  3. Generate a formal Cover Letter (PDF ready).
  4. Generate a short, punchy Email Intro (for pasting into email body).
  5. Analyze changes.
  `;

  // Construct parts for multimodal input
  const parts: any[] = [];

  if (data.resumeData && data.resumeMimeType) {
    parts.push({
      inlineData: {
        mimeType: data.resumeMimeType,
        data: data.resumeData
      }
    });
  }

  parts.push({
    text: `
    TARGET JOB DESCRIPTION:
    ${data.jobDescription}

    REQUIREMENTS:
    1. Rewrite resume (NO SUMMARY).
    2. Extract job URL if present.
    3. List changes with specific reasons and the EXACT quote from the new resume.
    4. Write a formal Cover Letter.
    5. Write a short application email body.
    `
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                changes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      change: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      quote: { type: Type.STRING, description: "The exact text phrase from the new resume that corresponds to this change." }
                    }
                  }
                },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                jobUrl: { type: Type.STRING },
                coverLetter: { type: Type.STRING, description: "Full formal cover letter text." },
                coverEmail: { type: Type.STRING, description: "Short, professional email body text for sending the application." }
              }
            },
            optimizedResumeMarkdown: {
              type: Type.STRING,
              description: "The complete rewritten resume in Markdown. NO SUMMARY section."
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated.");

    const jsonResponse = JSON.parse(text);

    return {
      markdown: jsonResponse.optimizedResumeMarkdown,
      analysis: jsonResponse.analysis
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let msg = "Failed to optimize resume.";
    if (error.message?.includes("400")) {
      msg += " The file format might not be supported or the content is too large.";
    }
    throw new Error(msg);
  }
};