import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/claude';
import { Game, GameSession } from '@/types/game';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { hintLevel, userMessage: customMessage, session, game }: {
      hintLevel: number;
      userMessage?: string;
      session: GameSession;
      game: Game;
    } = await req.json();

    const currentStation = game.stations[session.currentStationId];
    const staticHint = currentStation.hints[Math.min(Math.max(hintLevel, 0), 2)];

    // Dev mode: skip API, use static hints
    if (process.env.USE_AI !== 'true') {
      if (hintLevel === -1) {
        return NextResponse.json({ hint: `${game.character.name} מקשיב... ${currentStation.task.split('.')[0]}. תמשיכו לחפש!` });
      }
      return NextResponse.json({ hint: staticHint });
    }

    const systemPrompt = buildSystemPrompt(game, currentStation, session.completedStations, game.character);

    const userMsg = customMessage ?? (
      hintLevel === 0 ? 'אני צריך רמז קטן בבקשה'
      : hintLevel === 1 ? 'אני עדיין תקוע, תן לי רמז יותר ברור'
      : 'אנחנו ממש צריכים עזרה, תן לנו רמז ממש ספציפי'
    );

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }],
    });

    const hint = response.content[0].type === 'text' ? response.content[0].text : staticHint;
    return NextResponse.json({ hint });
  } catch (error) {
    console.error('Hint API error:', error);
    return NextResponse.json({ error: 'Failed to get hint' }, { status: 500 });
  }
}
