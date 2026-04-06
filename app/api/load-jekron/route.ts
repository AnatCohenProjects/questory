import { jekronYaakov } from '@/lib/jekronYaakov';

export async function GET() {
  try {
    return Response.json({
      success: true,
      message: 'משחק דיכרון יעקב נטען בהצלחה',
      game: jekronYaakov,
    });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
