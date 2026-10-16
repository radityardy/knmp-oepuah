export interface StatItem {
  id: string;
  value: string; // Nilai angka / jumlah (misal: "142", "3,8", "Rp 148.500.000")
  unit?: string; // Satuan fleksibel (misal: "Unit", "Ton", "KK", "°C", atau kosong jika sudah ada Rp di nilai)
  label: string;
  detail: string;
  trendLabel?: string; // misal: "+12 unit thn ini", "+15% musim pelagis", "Sehat & Transparan"
  trendType?: 'up' | 'down' | 'neutral';
  trendPattern?: 'up' | 'stable' | 'wave';
  chartData?: number[];
}

export interface PengurusItem {
  id: string;
  name: string;
  role: string;
  email?: string; // opsional: bisa diisi atau dikosongkan sebebas admin
  phone?: string; // opsional: nomor telepon / WhatsApp pengurus
  photoUrl: string;
}

export interface ProductItem {
  id: string;
  name: string;
  latinName: string;
  category: string;
  pricePerKg: string;
  availability: 'Tersedia' | 'Terbatas' | 'Musiman';
  description: string;
  imageUrl: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  content?: string; // isi detail pengumuman / artikel blog lengkap
  imageUrl?: string; // gambar banner pengumuman / artikel seperti blog
  attachmentUrl?: string;
}

export interface CmsData {
  beranda: {
    eyebrow: string;
    title: string;
    description: string;
    heroImageUrl: string;
    // Header visual ekosistem laut yang bisa di-hyperlink dan diedit admin
    heroCardTitle?: string;
    heroCardCoords?: string;
    heroCardLink?: string;
    statsTitle: string;
    statsSubtitle: string;
    stats: StatItem[];
  };
  pengurusSection: {
    title: string;
    subtitle: string;
    items: PengurusItem[];
  };
  mengenalKami: {
    title: string;
    subtitle: string;
    narrative: string;
    vision: string;
    missions: string[];
    imageUrl: string;
    address: string;
    phone: string;
    email: string;
  };
  produkSection: {
    title: string;
    subtitle: string;
    items: ProductItem[];
  };
  pengumumanSection: {
    title: string;
    subtitle: string;
    items: AnnouncementItem[];
  };
}