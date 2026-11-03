import { NextRequest, NextResponse } from 'next/server';
import { getCmsData, INITIAL_CMS_DATA, saveCmsData } from '@/lib/db';
import {
  checkRateLimit,
  sanitizeCmsPayload,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

const COOKIE_NAME = 'knmp_admin_session';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET() {
  const data = getCmsData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function PUT(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`cms-write:${ip}`, 30, 5 * 60 * 1000);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Batas penyimpanan terlampaui. Coba lagi dalam ${rate.retryAfterSeconds} detik.` },
      { status: 429 }
    );
  }

  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const headerKey = req.headers.get('x-admin-key');

  const isSessionValid = verifyAdminSessionToken(sessionToken);
  const isHeaderValid = headerKey ? verifyAdminPassword(headerKey) : false;

  if (!isSessionValid && !isHeaderValid) {
    return NextResponse.json(
      { error: 'Sesi otorisasi tidak valid atau telah berakhir. Silakan masuk kembali.' },
      { status: 401 }
    );
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran data melebihi batas maksimum (8 MB).' },
        { status: 413 }
      );
    }

    const parsed = JSON.parse(rawBody) as unknown;
    const sanitized = sanitizeCmsPayload(parsed, INITIAL_CMS_DATA);
    saveCmsData(sanitized);

    return NextResponse.json({
      ok: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payload tidak valid.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
