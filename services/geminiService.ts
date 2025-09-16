
import { GoogleGenAI, Type } from "@google/genai";
import type { FileReview, RepoFileWithContent } from '../types';
import { FeedbackSeverity } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, one-sentence summary of the file's main purpose."
        },
        feedback: {
            type: Type.ARRAY,
            description: "A list of feedback items for the code.",
            items: {
                type: Type.OBJECT,
                properties: {
                    line: {
                        type: Type.INTEGER,
                        description: "The line number the feedback pertains to."
                    },
                    severity: {
                        type: Type.STRING,
                        description: "The severity of the issue.",
                        enum: [FeedbackSeverity.High, FeedbackSeverity.Medium, FeedbackSeverity.Low, FeedbackSeverity.Info],
                    },
                    suggestion: {
                        type: Type.STRING,
                        description: "A clear, actionable suggestion for improvement."
                    }
                },
                required: ["line", "severity", "suggestion"],
            }
        }
    },
    required: ["summary", "feedback"],
};

const PROMPT_TEMPLATE = `You are an expert code reviewer with years of experience. Your task is to provide a concise and helpful review of the provided code file.

File Path: {filePath}

Code:
\`\`\`
{fileContent}
\`\`\`

Please perform the following actions:
1.  Write a brief, one-sentence summary of the file's purpose.
2.  Analyze the code for potential bugs, style violations, performance issues, and areas for improvement.
3.  For each issue found, provide the line number, a severity level, and a clear, actionable suggestion.
    - 'High': Critical bugs or security vulnerabilities.
    - 'Medium': Important functional or performance issues.
    - 'Low': Style nits, best practice deviations.
    - 'Info': General suggestions or observations.
4.  If the code is perfect and has no issues, return an empty array for feedback.
5.  Respond ONLY with a valid JSON object that adheres to the provided schema. Do not include any markdown formatting or introductory text outside the JSON object.`;


export async function reviewCodeFile(file: RepoFileWithContent): Promise<FileReview> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = PROMPT_TEMPLATE
            .replace('{filePath}', file.path)
            .replace('{fileContent}', file.content);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });

        const jsonText = response.text.trim();
        const reviewData = JSON.parse(jsonText);

        return {
            filePath: file.path,
            summary: reviewData.summary,
            feedback: reviewData.feedback,
        };

    } catch (error: unknown) {
        console.error(`Error reviewing file ${file.path}:`, error);
        const errorMessage = error instanceof Error ? `Gemini API Error: ${error.message}` : 'Failed to parse AI response.';
        return {
            filePath: file.path,
            feedback: [],
            error: errorMessage,
        };
    }
}
