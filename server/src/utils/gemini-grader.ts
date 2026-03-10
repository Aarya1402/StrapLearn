import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export interface GeminiEvaluation {
    score: number;          // 0–1
    result: 'correct' | 'partial' | 'incorrect';
    feedback: string;
    missing_points: string[];
}

/**
 * Uses Gemini 1.5 Flash to semantically evaluate a short-answer quiz response.
 *
 * Returns a rich evaluation object with score (0–1), result label, feedback,
 * and a list of missing points.
 *
 * Falls back to exact-match scoring if GEMINI_API_KEY is not set.
 */
export async function evaluateAnswerWithGemini(
    question: string,
    correctAnswer: string,
    studentAnswer: string,
): Promise<GeminiEvaluation> {
    const isExactMatch = (studentAnswer ?? '').trim().toLowerCase() === (correctAnswer ?? '').trim().toLowerCase();
    const fallbackResult: GeminiEvaluation = {
        score: isExactMatch ? 1 : 0,
        result: isExactMatch ? 'correct' : 'incorrect',
        feedback: isExactMatch ? 'Correct!' : 'Incorrect answer.',
        missing_points: [],
    };

    if (!apiKey) {
        console.warn('[Gemini] GEMINI_API_KEY not set — falling back to exact match.');
        return fallbackResult;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
Evaluate the student's answer.

Question:
${question}

Correct Answer:
${correctAnswer}

Student Answer:
${studentAnswer || '(no answer provided)'}

Score from 0 to 1.

Return JSON:
{
  "score": number,
  "result": "correct" | "partial" | "incorrect",
  "feedback": "short feedback",
  "missing_points": ["point1", "point2"]
}
`.trim();

    try {
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'You are an exam evaluator.' }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am ready to evaluate student answers.' }],
                },
            ],
        });

        const result = await chat.sendMessage(prompt);
        const text = result.response.text().trim();

        // Extract JSON block (Gemini may wrap in markdown code fences)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON found in Gemini response');

        const parsed = JSON.parse(jsonMatch[0]) as Partial<GeminiEvaluation>;

        return {
            score: Math.min(1, Math.max(0, typeof parsed.score === 'number' ? parsed.score : 0)),
            result: ['correct', 'partial', 'incorrect'].includes(parsed.result as string)
                ? (parsed.result as GeminiEvaluation['result'])
                : 'incorrect',
            feedback: typeof parsed.feedback === 'string' ? parsed.feedback : '',
            missing_points: Array.isArray(parsed.missing_points) ? parsed.missing_points : [],
        };
    } catch (err) {
        console.error('[Gemini] Evaluation error:', err);
        return fallbackResult;
    }
}
