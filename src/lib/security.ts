import crypto from 'crypto';
import { CmsData, StatItem, PengurusItem, ProductItem, AnnouncementItem } from '@/types/cms';

const DEFAULT_ADMIN_PASS = 'MerahPutih2026';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 jam

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    crypto.createHash('sha256').update(`knmp-oepuah-secret:${getAdminPassword()}`).digest('hex')
  );
}

/**
 * Perbandingan string secara constant-time untuk mencegah timing side-channel attack.
 */
export function verifyAdminPassword(candidate: string): boolean {
  if (!candidate || typeof candidate !== 'string') return false;
  const expectedHash = crypto.createHash('sha256').update(getAdminPassword()).digest();
  const candidateHash = crypto.createHash('sha256').update(candidate).digest();
  return crypto.timingSafeEqual(expectedHash, candidateHash);
}

/**
 * Membuat token sesi admin bertanda tangan HMAC-SHA256.
 */
export function createAdminSessionToken(): string {
  const payload = {
    role: 'knmp_admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Memverifikasi token sesi admin HMAC-SHA256 secara constant-time.
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  const sigHash = crypto.createHash('sha256').update(signature).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedSig).digest();

  if (!crypto.timingSafeEqual(sigHash, expectedHash)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    if (decoded.role !== 'knmp_admin') return false;
    if (typeof decoded.exp !== 'number' || Date.now() > decoded.exp) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * In-memory Rate Limiter untuk melindungi endpoint login & mutasi CMS dari brute-force.
 */
interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();

export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateBuckets.get(key);

  if (!existing || now > existing.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - existing.count),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key: string): void {
  rateBuckets.delete(key);
}

/**
 * Sanitasi teks untuk menghapus karakter kontrol berbahaya, invisible zero-width chars,
 * dan injeksi tag script/event handler.
 */
export function sanitizeText(input: unknown, maxLength = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    // Hapus karakter kontrol ASCII (kecuali newline \n dan tab \t)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Hapus karakter zero-width / bidi override tersembunyi
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    // Hapus injeksi tag script
    .replace(/<\s*\/?\s*script\b[^>]*>/gi, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitasi URL gambar atau tautan agar hanya mengizinkan protokol aman
 * (https:, http:, mailto:, tel:, path relatif /, atau data:image/* base64 non-SVG).
 */
export function sanitizeUrl(input: unknown, maxLength = 1500000): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLength);
  if (!trimmed) return '';

  if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed.replace(/[\u0000-\u001F<>"]/g, '');
  }

  try {
    const parsed = new URL(trimmed);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Validasi dan sanitasi menyeluruh pada objek CmsData sebelum disimpan ke disk.
 */
export function sanitizeCmsPayload(raw: unknown, fallback: CmsData): CmsData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Payload CMS tidak valid.');
  }

  const data = raw as Partial<CmsData>;

  const rawStats = Array.isArray(data.beranda?.stats) ? data.beranda!.stats.slice(0, 24) : fallback.beranda.stats;
  const stats: StatItem[] = rawStats.map((item, idx) => ({
    id: sanitizeText(item?.id || `stat-${idx + 1}`, 64) || `stat-${idx + 1}`,
    label: sanitizeText(item?.label, 120) || 'Metrik Operasional',
    value: sanitizeText(item?.value, 80) || '0',
    unit: sanitizeText(item?.unit ?? '', 32),
    detail: sanitizeText(item?.detail, 240),
    trendLabel: sanitizeText(item?.trendLabel ?? '', 80),
    trendType:
      item?.trendType === 'up' || item?.trendType === 'down' || item?.trendType === 'neutral'
        ? item.trendType
        : 'neutral',
  }));

  const rawPengurus = Array.isArray(data.pengurusSection?.items)
    ? data.pengurusSection!.items.slice(0, 40)
    : fallback.pengurusSection.items;
  const pengurusItems: PengurusItem[] = rawPengurus.map((p, idx) => ({
    id: sanitizeText(p?.id || `p-${idx + 1}`, 64) || `p-${idx + 1}`,
    name: sanitizeText(p?.name, 140) || 'Pengurus KNMP',
    role: sanitizeText(p?.role, 140) || 'Koordinator',
    email: sanitizeText(p?.email ?? '', 160),
    phone: sanitizeText(p?.phone ?? '', 60),
    photoUrl:
      sanitizeUrl(p?.photoUrl) ||
      '/images/pengurus-1.svg',
  }));

  const rawMissions = Array.isArray(data.mengenalKami?.missions)
    ? data.mengenalKami!.missions.slice(0, 20)
    : fallback.mengenalKami.missions;
  const missions = rawMissions
    .map((m) => sanitizeText(m, 400))
    .filter((m) => m.length > 0);

  const rawProducts = Array.isArray(data.produkSection?.items)
    ? data.produkSection!.items.slice(0, 60)
    : fallback.produkSection.items;
  const productItems: ProductItem[] = rawProducts.map((prd, idx) => ({
    id: sanitizeText(prd?.id || `prd-${idx + 1}`, 64) || `prd-${idx + 1}`,
    name: sanitizeText(prd?.name, 140) || 'Komoditas Laut',
    latinName: sanitizeText(prd?.latinName, 140),
    category: sanitizeText(prd?.category, 80) || 'Pelagis',
    pricePerKg: sanitizeText(prd?.pricePerKg, 60) || 'Rp 0',
    availability:
      prd?.availability === 'Tersedia' ||
      prd?.availability === 'Terbatas' ||
      prd?.availability === 'Musiman'
        ? prd.availability
        : 'Tersedia',
    description: sanitizeText(prd?.description, 600),
    imageUrl:
      sanitizeUrl(prd?.imageUrl) ||
      '/images/kakap-merah.svg',
  }));

  const rawAnnouncements = Array.isArray(data.pengumumanSection?.items)
    ? data.pengumumanSection!.items.slice(0, 50)
    : fallback.pengumumanSection.items;
  const announcementItems: AnnouncementItem[] = rawAnnouncements.map((ann, idx) => ({
    id: sanitizeText(ann?.id || `ann-${idx + 1}`, 64) || `ann-${idx + 1}`,
    title: sanitizeText(ann?.title, 220) || 'Pengumuman Koperasi',
    date: sanitizeText(ann?.date, 80) || '2026',
    category: sanitizeText(ann?.category, 80) || 'Operasional',
    summary: sanitizeText(ann?.summary, 600),
    content: sanitizeText(ann?.content ?? '', 12000),
    imageUrl: sanitizeUrl(ann?.imageUrl ?? ''),
  }));

  return {
    beranda: {
      eyebrow: sanitizeText(data.beranda?.eyebrow ?? fallback.beranda.eyebrow, 160),
      title: sanitizeText(data.beranda?.title ?? fallback.beranda.title, 300),
      description: sanitizeText(data.beranda?.description ?? fallback.beranda.description, 1000),
      heroImageUrl: sanitizeUrl(data.beranda?.heroImageUrl ?? ''),
      heroCardTitle: sanitizeText(
        data.beranda?.heroCardTitle ?? fallback.beranda.heroCardTitle,
        160
      ),
      heroCardCoords: sanitizeText(
        data.beranda?.heroCardCoords ?? fallback.beranda.heroCardCoords,
        80
      ),
      heroCardLink:
        sanitizeUrl(data.beranda?.heroCardLink ?? fallback.beranda.heroCardLink) ||
        'https://maps.google.com/?q=-9.15,124.58',
      statsTitle: sanitizeText(data.beranda?.statsTitle ?? fallback.beranda.statsTitle, 160),
      statsSubtitle: sanitizeText(
        data.beranda?.statsSubtitle ?? fallback.beranda.statsSubtitle,
        300
      ),
      stats: stats.length > 0 ? stats : fallback.beranda.stats,
    },
    pengurusSection: {
      title: sanitizeText(
        data.pengurusSection?.title ?? fallback.pengurusSection.title,
        160
      ),
      subtitle: sanitizeText(
        data.pengurusSection?.subtitle ?? fallback.pengurusSection.subtitle,
        300
      ),
      items: pengurusItems,
    },
    mengenalKami: {
      title: sanitizeText(data.mengenalKami?.title ?? fallback.mengenalKami.title, 180),
      subtitle: sanitizeText(
        data.mengenalKami?.subtitle ?? fallback.mengenalKami.subtitle,
        300
      ),
      narrative: sanitizeText(
        data.mengenalKami?.narrative ?? fallback.mengenalKami.narrative,
        6000
      ),
      vision: sanitizeText(data.mengenalKami?.vision ?? fallback.mengenalKami.vision, 1000),
      missions: missions.length > 0 ? missions : fallback.mengenalKami.missions,
      imageUrl:
        sanitizeUrl(data.mengenalKami?.imageUrl) || fallback.mengenalKami.imageUrl,
      address: sanitizeText(
        data.mengenalKami?.address ?? fallback.mengenalKami.address,
        350
      ),
      phone: sanitizeText(data.mengenalKami?.phone ?? fallback.mengenalKami.phone, 60),
      email: sanitizeText(data.mengenalKami?.email ?? fallback.mengenalKami.email, 160),
    },
    produkSection: {
      title: sanitizeText(data.produkSection?.title ?? fallback.produkSection.title, 160),
      subtitle: sanitizeText(
        data.produkSection?.subtitle ?? fallback.produkSection.subtitle,
        300
      ),
      items: productItems,
    },
    pengumumanSection: {
      title: sanitizeText(
        data.pengumumanSection?.title ?? fallback.pengumumanSection.title,
        160
      ),
      subtitle: sanitizeText(
        data.pengumumanSection?.subtitle ?? fallback.pengumumanSection.subtitle,
        300
      ),
      items: announcementItems,
    },
  };
}

