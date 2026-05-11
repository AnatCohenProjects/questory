import Anthropic from '@anthropic-ai/sdk';
import { NormalizedPuzzleContext } from '@/lib/normalization';
import { DetectedHook } from '@/lib/hookDetection';
import { TemplateRecommendation } from '@/lib/templateMatcher';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── AI-Generated Challenge Content ────────────────────────────────────────

export interface AIGeneratedChallenge {
  title: string;
  question: string;
  hints: [string, string, string];
  options?: { text: string; isCorrect: boolean }[];
  series?: string[];
  items?: string[];
  solution: string;
  explanation: string;
}

// ─── Generate Challenge with Claude ───────────────────────────────────────

export async function generateChallengeWithAI(
  context: NormalizedPuzzleContext,
  hook: DetectedHook,
  template: TemplateRecommendation,
  language: string = 'he'
): Promise<AIGeneratedChallenge> {
  const prompt = buildPrompt(context, hook, template, language);

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return parseAIResponse(responseText, template.challengeType);
}

// ─── Build Prompt ─────────────────────────────────────────────────────────

function buildPrompt(
  context: NormalizedPuzzleContext,
  hook: DetectedHook,
  template: TemplateRecommendation,
  language: string
): string {
  return `You are a creative puzzle designer creating an interactive challenge for a mobile game called Questory.

Context (the physical item/location):
- Object: ${context.object_name}
- Category: ${context.category}
- Attributes: ${context.visible_attributes.join(', ')}
- Era: ${context.temporal_context || 'modern'}
- Significance: ${context.cultural_significance || 'general'}
- Keywords: ${context.keywords.join(', ')}

Detected Logic (Hook):
- Type: ${hook.type}
- Reasoning: ${hook.reasoning}
- Confidence: ${hook.confidence}

Recommended Challenge Type:
- Type: ${template.challengeType}
- Reasoning: ${template.reasoning}

TASK:
Generate a ${template.challengeType} challenge that uses the detected logic (${hook.type}) to create an engaging puzzle for discovering the object "${context.object_name}".

The response MUST be valid JSON with this exact structure (no markdown, no code blocks, just JSON):

{
  "title": "Short title for the challenge (2-5 words, in ${language})",
  "question": "The main question or instruction (1-2 sentences, in ${language})",
  "hints": [
    "First hint: directional/encouraging",
    "Second hint: more specific",
    "Third hint: almost revealing"
  ],
  ${template.challengeType === 'trivia' ? '"options": [{"text": "Option 1 (in ' + language + ')", "isCorrect": false}, {"text": "Correct answer", "isCorrect": true}],' : ''}
  ${template.challengeType === 'pattern' ? '"series": ["item1", "item2", "_", "item4"] (use _ for blank, in ' + language + '),' : ''}
  ${template.challengeType === 'oddoneout' ? '"items": ["Item A", "Item B", "Item C", "Item D (the odd one)"] (in ' + language + '),' : ''}
  "solution": "The correct answer or code (${hook.type === 'counting' ? 'number' : 'text'}, in ${language})",
  "explanation": "Why this is the correct answer (1-2 sentences, in ${language})"
}

Create a challenge that is:
- Engaging and intuitive
- Based on real-world observation of "${context.object_name}"
- Using the ${hook.type} logic naturally
- Appropriate for players aged 8-16
- In Hebrew
`;
}

// ─── Parse AI Response ─────────────────────────────────────────────────────

function parseAIResponse(
  responseText: string,
  challengeType: string
): AIGeneratedChallenge {
  try {
    // Try to extract JSON if wrapped in markdown
    let json = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      json = jsonMatch[1];
    }

    const parsed = JSON.parse(json);

    // Ensure correct structure based on challenge type
    if (challengeType === 'trivia' && !parsed.options) {
      parsed.options = [
        { text: 'Option 1', isCorrect: false },
        { text: parsed.solution, isCorrect: true },
      ];
    }

    if (challengeType === 'pattern' && !parsed.series) {
      parsed.series = ['_', '_', '_'];
    }

    if (challengeType === 'oddoneout' && !parsed.items) {
      parsed.items = ['Item 1', 'Item 2', 'Item 3', parsed.solution];
    }

    return parsed as AIGeneratedChallenge;
  } catch (error) {
    // Fallback if parsing fails
    console.error('Failed to parse AI response:', error);
    return {
      title: 'Challenge',
      question: 'What is the answer?',
      hints: ['Hint 1', 'Hint 2', 'Hint 3'],
      solution: '?',
      explanation: 'Unable to generate challenge',
    };
  }
}
