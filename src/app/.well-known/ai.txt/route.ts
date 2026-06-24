import {GET as ai} from '../../ai.txt/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return ai();
}
