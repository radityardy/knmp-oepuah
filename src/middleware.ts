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

  const isAdminSubdomain =
    host.startsWith('admin.') ||
    host.startsWith('admin-') ||
    host.includes('admin.oepuah') ||
    host.includes('admin.ouepuah');

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
  // Jika diakses via IP address langsung (misal: 192.168.x.x, 103.x.x.x) atau localhost,
  // izinkan akses langsung ke /admin agar testing Docker / server tanpa domain tetap bisa berjalan lancar.
  // Jika sudah pakai nama domain resmi (bukan IP), akses /admin dari domain utama dialihkan ke beranda.
  const isDirectIpOrLocal =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$/.test(host);

  if (!isDirectIpOrLocal && !isAdminSubdomain && url.pathname.startsWith('/admin')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}