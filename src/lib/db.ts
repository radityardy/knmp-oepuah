import fs from 'fs';
import path from 'path';
import { CmsData } from '@/types/cms';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'cms.json');

export const INITIAL_CMS_DATA: CmsData = {
  beranda: {
    eyebrow: 'KAMPUNG NELAYAN MERAH PUTIH — KABUPATEN TIMOR TENGAH UTARA',
    title: 'Selamat datang di Kampung Nelayan Merah Putih Oepuah, Nusa Tenggara Timur',
    description:
      'Sentra maritim terpadu pesisir utara Pulau Timor. Mengelola pendaratan ikan segar berstandar rantai dingin, tata kelola koperasi transparan, dan pemberdayaan masyarakat nelayan Oepuah.',
    heroImageUrl: '',
    heroCardTitle: 'Ekosistem Perairan Laut Sawu — Oepuah',
    heroCardCoords: "09°09'S 124°35'E",
    heroCardLink: 'https://maps.google.com/?q=-9.15,124.58',
    statsTitle: 'Metrik Operasional Pesisir',
    statsSubtitle: 'Data kapasitas produksi, keanggotaan aktif, dan tren kinerja Koperasi Nelayan Oepuah.',
    stats: [
      {
        id: '1',
        label: 'Armada Tangkap',
        value: '142',
        unit: 'Unit',
        detail: 'Perahu motor tempel & kapal < 10 GT',
        trendLabel: '+12 unit thn ini',
        trendType: 'up',
      },
      {
        id: '2',
        label: 'Volume Harian',
        value: '3,8',
        unit: 'Ton',
        detail: 'Rata-rata pendaratan ikan segar per hari',
        trendLabel: '+15% musim pelagis',
        trendType: 'up',
      },
      {
        id: '3',
        label: 'Anggota Koperasi',
        value: '285',
        unit: 'KK',
        detail: 'Keluarga nelayan pesisir Desa Oepuah',
        trendLabel: '100% nelayan lokal',
        trendType: 'neutral',
      },
      {
        id: '4',
        label: 'Standar Cold Storage',
        value: '-22',
        unit: '°C',
        detail: 'Fasilitas pembekuan & es balok mandiri',
        trendLabel: 'Mutu ekspor sashimi',
        trendType: 'neutral',
      },
      {
        id: '5',
        label: 'Kas KNMP Oepuah',
        value: 'Rp 148.500.000',
        unit: '',
        detail: 'Likuiditas simpan pinjam & modal es nelayan',
        trendLabel: 'Kas Lancar & Transparan',
        trendType: 'up',
      },
    ],
  },
  pengurusSection: {
    title: 'Dewan Pengurus & Koordinator',
    subtitle: 'Struktur pengelola operasional Kampung Nelayan Merah Putih Oepuah.',
    items: [
      {
        id: 'p1',
        name: 'Yohanes Lake, S.Pi',
        role: 'Ketua Pengelola Kampung Nelayan',
        email: 'yohanes.lake@knmp-oepuah.id',
        phone: '+62 812-3940-8812',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p2',
        name: 'Maria Fransiska Bano',
        role: 'Sekretaris & Administrasi Koperasi',
        email: 'maria.bano@knmp-oepuah.id',
        phone: '+62 813-5321-7789',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'p3',
        name: 'Petrus Neonbeni',
        role: 'Kepala Unit Cold Storage & Mutu',
        email: 'petrus.neonbeni@knmp-oepuah.id',
        phone: '', // Opsional / bebas admin
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  mengenalKami: {
    title: 'Mengenal Kampung Nelayan Merah Putih Oepuah',
    subtitle: 'Transformasi ekonomi maritim di pesisir Biboki Moenleu, Nusa Tenggara Timur.',
    narrative:
      'Kampung Nelayan Merah Putih (KNMP) Oepuah merupakan inisiatif strategis penataan kawasan pesisir di Kabupaten Timor Tengah Utara. Berada di bibir perairan Laut Sawu yang kaya akan komoditas pelagis dan demersal, Oepuah mengintegrasikan dermaga pendaratan, instalasi pengolahan rantai dingin, serta koperasi pemasaran satu pintu.\n\nMelalui pengelolaan berbasis komunitas, seluruh hasil tangkapan nelayan lokal ditangani dengan standar sanitasi tinggi sehingga memiliki nilai jual kompetitif di pasar regional maupun ekspor.',
    vision:
      'Mewujudkan ekosistem kampung maritim modern yang mandiri secara ekonomi, berdaulat pangan, dan lestari secara ekologis di Nusa Tenggara Timur.',
    missions: [
      'Menjamin ketersediaan es balok dan fasilitas penyimpanan beku (Cold Storage) bagi seluruh nelayan anggota.',
      'Memangkas rantai distribusi melalui sistem lelang dan penjualan langsung Koperasi Merah Putih.',
      'Menerapkan alat tangkap ramah lingkungan guna menjaga keberlanjutan stok ikan karang dan pelagis Oepuah.',
      'Meningkatkan kapasitas manajemen keuangan keluarga nelayan pesisir.',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    address: 'Pesisir Desa Oepuah, Kec. Biboki Moenleu, Kab. Timor Tengah Utara, NTT 85681',
    phone: '+62 812-3940-8812',
    email: 'sekretariat@knmp-oepuah.id',
  },
  produkSection: {
    title: 'Katalog Komoditas Laut',
    subtitle: 'Hasil tangkapan segar harian nelayan Oepuah dengan penanganan rantai dingin.',
    items: [
      {
        id: 'prd1',
        name: 'Kakap Merah Oepuah',
        latinName: 'Lutjanus malabaricus',
        category: 'Demersal Premium',
        pricePerKg: 'Rp 68.000',
        availability: 'Tersedia',
        description:
          'Ditangkap menggunakan pancing ulur di perairan karang dalam Oepuah. Tekstur daging padat dengan penanganan dingin langsung di atas kapal.',
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'prd2',
        name: 'Tuna Sirip Kuning',
        latinName: 'Thunnus albacares',
        category: 'Pelagis Besar',
        pricePerKg: 'Rp 55.000',
        availability: 'Tersedia',
        description:
          'Komoditas unggulan perairan utara Timor. Tersedia dalam bentuk utuh segar (whole gilled & gutted) maupun loin beku.',
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80',
      },
      {
        id: 'prd3',
        name: 'Cakalang Segar',
        latinName: 'Katsuwonus pelamis',
        category: 'Pelagis',
        pricePerKg: 'Rp 36.000',
        availability: 'Tersedia',
        description:
          'Hasil tangkapan harian utama nelayan Oepuah untuk pasokan pasar daerah dan industri pengolahan ikan.',
        imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=700&q=80',
      },
    ],
  },
  pengumumanSection: {
    title: 'Warta & Pengumuman Resmi',
    subtitle: 'Kabar terkini seputar operasional koperasi nelayan, prakiraan cuaca, dan kegiatan komunitas Oepuah.',
    items: [
      {
        id: 'ann1',
        title: 'Jadwal Operasional Cold Storage & Distribusi Es Balok Subsidi',
        date: '16 Oktober 2026',
        category: 'Operasional',
        summary:
          'Pelayanan pengambilan es balok untuk armada tangkap pagi dibuka setiap hari pukul 04.30 WITA di Unit Produksi Es Koperasi KNMP Oepuah.',
        imageUrl: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=800&q=80',
        content:
          'Untuk memastikan rantai dingin (cold chain) hasil tangkapan nelayan Oepuah tetap optimal, Koperasi Nelayan Merah Putih mengumumkan jadwal operasional cold storage dan unit pabrik es balok harian:\n\n1. Pembagian Es Pagi: 04.30 - 06.00 WITA untuk perahu pancing ulur dan jaring lingkar.\n2. Pembagian Es Sore: 16.00 - 17.30 WITA untuk armada malam.\n3. Biaya es balok subsidi anggota sebesar Rp 12.000 per balok 25 kg.\n\nDihimbau kepada seluruh nahkoda untuk membawa palka insulasi saat pengambilan es guna meminimalkan penyusutan.',
      },
      {
        id: 'ann2',
        title: 'Informasi Prakiraan Gelombang Perairan Utara Timor Tengah Utara',
        date: '14 Oktober 2026',
        category: 'Keselamatan Laut',
        summary:
          'Berdasarkan rilis Stasiun Meteorologi Maritim Tenau Kupang, tinggi gelombang perairan Oepuah berkisar 0,5 hingga 1,25 meter dengan angin timuran 10–15 knot.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        content:
          'BMKG Maritim mengeluarkan peringatan dini cuaca perairan Laut Sawu dan Selat Ombai:\n\n- Kecepatan angin timuran: 10 s/d 18 knot.\n- Tinggi gelombang rata-rata: 0,75 - 1,25 meter (kategori tenang hingga sedang).\n- Jarak pandang laut: > 8 kilometer.\n\nKondisi relatif kondusif untuk melaut bagi perahu motor tempel dan armada tangkap < 10 GT. Tetap lengkapi perahu dengan alat keselamatan (life jacket) dan lampu navigasi.',
      },
    ],
  },
};

export function getCmsData(): CmsData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_CMS_DATA, null, 2), 'utf-8');
      return INITIAL_CMS_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw.trim()) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_CMS_DATA, null, 2), 'utf-8');
      return INITIAL_CMS_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<CmsData>;
    // Merge dengan initial data untuk memastikan backward-compatibility field baru
    return {
      ...INITIAL_CMS_DATA,
      ...parsed,
      beranda: {
        ...INITIAL_CMS_DATA.beranda,
        ...(parsed.beranda || {}),
        stats: parsed.beranda?.stats || INITIAL_CMS_DATA.beranda.stats,
      },
      pengurusSection: {
        ...INITIAL_CMS_DATA.pengurusSection,
        ...(parsed.pengurusSection || {}),
        items: parsed.pengurusSection?.items || INITIAL_CMS_DATA.pengurusSection.items,
      },
      mengenalKami: {
        ...INITIAL_CMS_DATA.mengenalKami,
        ...(parsed.mengenalKami || {}),
        missions: parsed.mengenalKami?.missions || INITIAL_CMS_DATA.mengenalKami.missions,
      },
      produkSection: {
        ...INITIAL_CMS_DATA.produkSection,
        ...(parsed.produkSection || {}),
        items: parsed.produkSection?.items || INITIAL_CMS_DATA.produkSection.items,
      },
      pengumumanSection: {
        ...INITIAL_CMS_DATA.pengumumanSection,
        ...(parsed.pengumumanSection || {}),
        items: parsed.pengumumanSection?.items || INITIAL_CMS_DATA.pengumumanSection.items,
      },
    };
  } catch {
    return INITIAL_CMS_DATA;
  }
}

export function saveCmsData(data: CmsData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}