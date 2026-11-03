import { NextRequest, NextResponse } from 'next/server';
import {
  checkRateLimit,
  createAdminSessionToken,
  resetRateLimit,
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

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
  const authenticated = verifyAdminSessionToken(sessionCookie);
  return NextResponse.json(
    { authenticated },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitKey = `auth:${ip}`;
  const rate = checkRateLimit(rateLimitKey, 8, 10 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login. Silakan tunggu ${rate.retryAfterSeconds} detik.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = (await req.json()) as { password?: string };
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        {
          error: 'Kata sandi otorisasi tidak valid.',
          remainingAttempts: rate.remaining,
        },
        { status: 401 }
      );
    }

    resetRateLimit(rateLimitKey);
    const token = createAdminSessionToken();

    const response = NextResponse.json({
      authenticated: true,
      message: 'Otorisasi berhasil.',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 jam
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Format permintaan tidak valid.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false, message: 'Sesi diakhiri.' });
  response.cookies.delete(COOKIE_NAME);
  return response;
}

