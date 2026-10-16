import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') || '';

  // Lewati file statis dan endpoint API
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isAdminSubdomain = host.startsWith('admin.');

  // 1. Jika diakses via subdomain admin (misal: admin.knmp-oepuah.id atau admin.localhost:3000)
  // Rewrite secara transparan ke /admin sehingga URL di browser tetap bersih (tanpa embel-embel /admin)
  if (isAdminSubdomain) {
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // 2. Proteksi Production:
  // Cegah publik mengakses /admin lewat domain utama (dialihkan ke beranda).
  // Di local development (localhost / 127.0.0.1), akses langsung http://localhost:3000/admin tetap diizinkan untuk kemudahan testing.
  const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
  if (!isLocalDev && !isAdminSubdomain && url.pathname.startsWith('/admin')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}