import { NextRequest } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const draft = await req.json();

    const fileContent = `import { GameDraft } from '@/types/builder';

export const zichronYaakovDraft: GameDraft = ${JSON.stringify(draft, null, 2)};
`;

    const filePath = join(process.cwd(), 'lib', 'zichronYaakovDraft.ts');
    writeFileSync(filePath, fileContent, 'utf8');

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
