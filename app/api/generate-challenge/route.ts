import { NextRequest, NextResponse } from 'next/server';
import { generateChallengeWithAI } from './lib';
import { NormalizedPuzzleContext } from '@/lib/normalization';
import { DetectedHook } from '@/lib/hookDetection';
import { TemplateRecommendation } from '@/lib/templateMatcher';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { context, hook, template } = body as {
      context: NormalizedPuzzleContext;
      hook: DetectedHook;
      template: TemplateRecommendation;
    };

    if (!context || !hook || !template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: context, hook, template',
        },
        { status: 400 }
      );
    }

    const challenge = await generateChallengeWithAI(context, hook, template, 'he');

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (error) {
    console.error('Error generating challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
