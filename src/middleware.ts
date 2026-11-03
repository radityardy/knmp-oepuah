import { NextRequest, NextResponse } from 'next/server';

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';"
  );
  return res;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // Lewati file statis dan endpoint API tetapi tetap sematkan security headers
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  const isAdminSubdomain =
    host.startsWith('admin.') ||
    host.startsWith('admin-') ||
    host.includes('admin.oepuah') ||
    host.includes('admin.ouepuah');

  // 1. Jika diakses via subdomain admin (misal: admin.knmp-oepuah.id, admin-oepuah.radityardy.my.id, atau admin.localhost:3000)
  // Rewrite secara transparan ke /admin sehingga URL di browser tetap bersih
  if (isAdminSubdomain) {
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      return applySecurityHeaders(NextResponse.rewrite(url));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Proteksi Production:
  // Jika diakses via IP address langsung (misal: 192.168.x.x, 10.x.x.x, 103.x.x.x) atau localhost,
  // izinkan akses langsung ke /admin agar operasional Docker / server tetap lancar.
  const isDirectIpOrLocal =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$/.test(host);

  if (!isDirectIpOrLocal && !isAdminSubdomain && url.pathname.startsWith('/admin')) {
    url.pathname = '/';
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(NextResponse.next());
}
