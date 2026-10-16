import { NextRequest, NextResponse } from 'next/server';
import { getCmsData, saveCmsData } from '@/lib/db';
import { CmsData } from '@/types/cms';

export const dynamic = 'force-dynamic';

const ADMIN_KEY = process.env.ADMIN_PASSWORD || 'MerahPutih2026';

export async function GET() {
  const data = getCmsData();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('x-admin-key');
  if (authHeader !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as CmsData;
    saveCmsData(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}

