import {GET as llms} from '../../llms.txt/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return llms();
}
