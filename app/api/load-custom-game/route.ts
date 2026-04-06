import { Game } from '@/types/game';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const game: Game = await request.json();

    // Validation
    if (!game.title || !game.stations || game.stations.length === 0) {
      return Response.json(
        { success: false, error: 'Game title and at least 1 station required' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'משחק custom נטען בהצלחה',
      game,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({
    success: true,
    message: 'POST JSON game object to load custom game',
    example: {
      title: 'Game Name',
      story: 'Game Story',
      stations: [{ id: 0, triggerType: 'code', triggerValue: '1', task: '...', hints: [], answer: '1' }],
      character: { name: 'Character', tone: 'Tone' },
    },
  });
}
