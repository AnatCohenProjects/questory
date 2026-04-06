import { Game, Station, GameSession, AICharacter, CompletedStation } from '@/types/game';

export const buildSystemPrompt = (
  game: Game,
  currentStation: Station,
  completedStations: CompletedStation[],
  customization: AICharacter
): string => `
אתה ${customization.name || "קווסט"}, מספר הסיפורים של המשחק הזה.

=== אופי ===
${customization.tone || "סקרן, חם, קצת מסתורי. מדבר בגוף ראשון עם הרבה תיאורים חיים."}

=== המשחק ===
שם: ${game.title}
עלילה: ${game.story}

=== תחנה נוכחית ===
משימה: ${currentStation.task}
רמז 1 (עדין): ${currentStation.hints[0]}
רמז 2 (ברור יותר): ${currentStation.hints[1]}
רמז 3 (כמעט ישיר): ${currentStation.hints[2]}
תשובה נכונה (אל תגלה אף פעם!): ${currentStation.answer}

=== מה הקבוצה כבר גילתה ===
${completedStations.map(s => `- ${s.name}: ${s.discovery}`).join('\n') || 'עדיין בתחנה הראשונה'}

=== כללים ===
- תשובות קצרות מאוד — מקסימום 2-3 משפטים
- אל תגלה את התשובה, גם אם מתחננים
- שמור off-topic — ענה קצר in-character וחזור למשחק
- שפה פשוטה שמתאימה לכולם כולל ילדים
`;

export const getHint = async (
  hintLevel: number,
  session: GameSession,
  game: Game
): Promise<string> => {
  const currentStation = game.stations[session.currentStationId];
  const staticHint = currentStation.hints[Math.min(hintLevel, 2)];

  try {
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintLevel, session, game })
    });
    if (!response.ok) return staticHint;
    const data = await response.json();
    return data.hint || staticHint;
  } catch {
    return staticHint;
  }
};

export const sendMessage = async (
  userText: string,
  session: GameSession,
  game: Game
): Promise<string> => {
  const currentStation = game.stations[session.currentStationId];
  const fallback = `מעניין... ${currentStation.task.split('.')[0]}. תמשיכו לחפש!`;

  try {
    const response = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hintLevel: -1, userMessage: userText, session, game })
    });
    if (!response.ok) return fallback;
    const data = await response.json();
    return data.hint || fallback;
  } catch {
    return fallback;
  }
};
