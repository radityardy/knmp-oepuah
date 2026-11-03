'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnnouncementItem, CmsData } from '@/types/cms';
import {
  Anchor,
  ArrowUp,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Fish,
  Home,
  Info,
  Layers,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Users,
  Waves,
  X,
} from 'lucide-react';

type SectionKey = 'beranda' | 'produk' | 'mengenal' | 'pengurus' | 'pengumuman';

const NAV_SECTIONS: {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'beranda', label: 'Beranda', icon: Home },
  { key: 'produk', label: 'Komoditas', icon: Fish },
  { key: 'mengenal', label: 'Profil Kawasan', icon: Info },
  { key: 'pengurus', label: 'Pengurus', icon: Users },
  { key: 'pengumuman', label: 'Warta', icon: Calendar },
];

export default function PublicPortalPage() {
  const [data, setData] = useState<CmsData | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetch('/api/cms', { cache: 'no-store' })
      .then((res) => res.json())
      .then((resData: CmsData) => setData(resData))
      .catch(() => {});
  }, []);

  // Scroll-Spy ringan tanpa membebani CPU HP spesifikasi rendah
  useEffect(() => {
    if (!data) return;

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setShowBackToTop(scrollY > 560);

        const viewportOffset = 150;
        let current: SectionKey = 'beranda';

        for (const section of NAV_SECTIONS) {
          const el = document.getElementById(section.key);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= viewportOffset) {
              current = section.key;
            }
          }
        }
        setActiveSection(current);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data]);

  const scrollToSection = useCallback((key: SectionKey) => {
    setActiveSection(key);
    setIsMobileSidebarOpen(false);
    const el = document.getElementById(key);
    if (el) {
      const headerOffset = 96;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, elementPosition - headerOffset);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleCopyEmail = (email: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    }
  };

  const productCategories = useMemo(() => {
    if (!data) return ['Semua'];
    const unique = Array.from(
      new Set(data.produkSection.items.map((item) => item.category).filter(Boolean))
    );
    return ['Semua', ...unique];
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.produkSection.items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.latinName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [data, searchQuery, selectedCategory]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-2.5 px-4 text-center">
        <div className="w-8 h-8 rounded-lg bg-[#071A2E] text-white flex items-center justify-center">
          <Anchor className="w-4 h-4" />
        </div>
        <p className="text-xs font-medium text-zinc-600">
          Memuat Portal Kampung Nelayan Merah Putih Oepuah...
        </p>
      </div>
    );
  }

  const cleanWaNumber = data.mengenalKami.phone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF8F5] text-zinc-900 flex flex-col antialiased selection:bg-[#071A2E] selection:text-white">
      {/* ================= STICKY TOP BAR (RINGAN, TANPA EFEK BLUR BERAT UNTUK HP 1 JUTAAN) ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-[1140px] mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Identitas Koperasi */}
          <button
            type="button"
            onClick={() => scrollToSection('beranda')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-lg"
          >
            <span className="w-8 h-8 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shrink-0">
              <Anchor className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 leading-tight">
                KNMP Oepuah
              </span>
              <span className="text-[11px] text-zinc-500 leading-tight">
                Kab. Timor Tengah Utara
              </span>
            </div>
          </button>

          {/* Navigasi Desktop (Satu Baris Rapi Tanpa Nomor) */}
          <nav aria-label="Navigasi Utama" className="hidden md:flex items-center gap-1">
            {NAV_SECTIONS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => scrollToSection(item.key)}
                  className={`px-3.5 py-2 rounded-lg text-xs transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                    isActive
                      ? 'bg-[#071A2E] text-white font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Tombol Aksi Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={`https://wa.me/${cleanWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors duration-150"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hubungi Koperasi</span>
            </a>
          </div>

          {/* Tombol Aksi Mobile (HP) */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`https://wa.me/${cleanWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center hover:bg-zinc-200"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Baris Menu Geser Mobile (Sederhana, Jelas, Tanpa Nomor) */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar px-4 py-2 gap-1.5 border-t border-zinc-200 bg-[#FAF8F5]">
          {NAV_SECTIONS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors duration-150 shrink-0 ${
                  isActive
                    ? 'bg-[#071A2E] text-white font-semibold'
                    : 'bg-white text-zinc-700 border border-zinc-200 font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ================= MENU SAMPING MOBILE (SLIDE-OUT DRAWER) ================= */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <aside
        aria-label="Menu Samping Mobile"
        className={`fixed top-0 bottom-0 right-0 z-50 w-[280px] max-w-[85vw] bg-white border-l border-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out md:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shrink-0">
                <Anchor className="w-3.5 h-3.5" />
              </span>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900">KNMP Oepuah</h3>
                <span className="text-[11px] text-zinc-500">Menu Halaman</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-lg bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-1">
            {NAV_SECTIONS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => scrollToSection(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#071A2E] text-white font-semibold'
                      : 'text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 bg-[#FAF8F5] space-y-2.5">
          <a
            href={`https://wa.me/${cleanWaNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Koperasi (WA)</span>
          </a>

          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-100 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Panel Pengelola</span>
          </a>
        </div>
      </aside>

      {/* ================= KONTEN UTAMA SINGLE-PAGE APPLICATION (SPA) ================= */}
      <main className="flex-1">
        {/* ================= BERANDA & METRIK OPERASIONAL ================= */}
        <section id="beranda" className="scroll-mt-24">
          <div className="bg-[#071A2E] text-white pt-8 sm:pt-12 pb-14 sm:pb-20 px-4 sm:px-6 border-b border-white/10">
            <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-7 min-w-0 space-y-4 sm:space-y-5">
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-1 rounded-md bg-white/[0.08] border border-white/[0.14] text-[11px] font-medium tracking-wide uppercase text-sky-200 overflow-hidden">
                  <Waves className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{data.beranda.eyebrow}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-snug sm:leading-[1.18] text-white">
                  {data.beranda.title}
                </h1>

                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                  {data.beranda.description}
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('produk')}
                    className="bg-white text-[#071A2E] hover:bg-zinc-100 px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <Fish className="w-4 h-4 text-sky-800" />
                    <span>Lihat Komoditas Laut</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('mengenal')}
                    className="px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white border border-white/25 hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Profil & Lokasi</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Kartu Visual Perairan Oepuah */}
              <div className="lg:col-span-5">
                {data.beranda.heroImageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/15 bg-[#0B2540]">
                    <a
                      href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-xs text-slate-200 px-4 py-3 bg-[#061526] border-b border-white/10 hover:text-sky-300 transition-colors"
                    >
                      <span className="font-medium text-white flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-sky-300 inline-flex items-center gap-1 shrink-0">
                        {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </a>
                    <img
                      src={data.beranda.heroImageUrl}
                      alt="Kawasan Pesisir Kampung Nelayan Oepuah"
                      className="w-full h-[240px] sm:h-[260px] object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#0B2540] border border-white/15 p-4 sm:p-5">
                    <a
                      href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-xs text-slate-200 pb-3 mb-3 border-b border-white/10 hover:text-sky-300 transition-colors"
                    >
                      <span className="font-medium text-white flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-[11px] text-sky-300 inline-flex items-center gap-1 shrink-0">
                        {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </a>

                    <svg
                      viewBox="0 0 400 210"
                      className="w-full h-auto rounded-lg bg-[#051324] border border-white/5"
                      role="img"
                      aria-label="Ilustrasi perairan Laut Sawu Oepuah"
                    >
                      <rect width="400" height="210" fill="#061930" />
                      <path d="M0 24 Q100 12 200 24 T400 24 L400 0 L0 0 Z" fill="#38BDF8" fillOpacity="0.15" />

                      {/* Kakap Merah */}
                      <g transform="translate(70, 70)">
                        <path d="M115 30 L148 10 L140 30 L148 50 Z" fill="#E11D48" />
                        <path d="M35 12 Q65 -8 92 12 Z" fill="#BE123C" />
                        <ellipse cx="64" cy="30" rx="58" ry="22" fill="#F43F5E" />
                        <ellipse cx="60" cy="34" rx="46" ry="13" fill="#FDA4AF" fillOpacity="0.45" />
                        <circle cx="22" cy="25" r="4" fill="#FFFFFF" />
                        <circle cx="21" cy="25" r="2" fill="#071A2E" />
                      </g>

                      {/* Tuna Sirip Kuning */}
                      <g transform="translate(215, 34) scale(0.75)">
                        <path d="M105 26 L135 6 L127 26 L135 46 Z" fill="#F59E0B" />
                        <ellipse cx="58" cy="26" rx="52" ry="18" fill="#38BDF8" />
                        <ellipse cx="58" cy="31" rx="44" ry="10" fill="#E0F2FE" fillOpacity="0.6" />
                        <circle cx="20" cy="23" r="4" fill="#FFFFFF" />
                        <circle cx="19" cy="23" r="2" fill="#071A2E" />
                      </g>

                      {/* Cakalang */}
                      <g transform="translate(45, 138) scale(0.65)">
                        <path d="M95 22 L122 6 L115 22 L122 38 Z" fill="#0284C7" />
                        <ellipse cx="52" cy="22" rx="46" ry="16" fill="#7DD3FC" />
                        <circle cx="18" cy="19" r="3.5" fill="#071A2E" />
                      </g>

                      <path d="M0 194 Q110 182 220 196 T400 188 L400 210 L0 210 Z" fill="#030B16" />
                    </svg>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                      <span>Perairan Utara Pulau Timor</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Rantai Dingin Aktif
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kartu Metrik Operasional (Bersih, Tanpa Badge Seksi atau Nomor Urut) */}
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6 -mt-6 sm:-mt-8 pb-10 sm:pb-14">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-zinc-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
                    {data.beranda.statsTitle}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{data.beranda.statsSubtitle}</p>
                </div>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                  Data Koperasi Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mt-4">
                {data.beranda.stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="p-4 rounded-lg bg-[#FAF8F5] border border-zinc-200 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-medium text-zinc-600 block">
                        {stat.label}
                      </span>

                      <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight text-zinc-900 my-1.5">
                        {stat.value}
                        {stat.unit && (
                          <span className="text-xs sm:text-sm font-mono font-normal text-zinc-500 ml-1">
                            {stat.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-200/70 space-y-1">
                      {stat.trendLabel && (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {stat.trendLabel}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600 block leading-snug">
                        {stat.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= KATALOG KOMODITAS LAUT ================= */}
        <section
          id="produk"
          className="scroll-mt-24 py-10 sm:py-14 border-t border-zinc-200 bg-white"
        >
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
                  Hasil Tangkapan Nelayan
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                  {data.produkSection.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {data.produkSection.subtitle}
                </p>
              </div>

              {/* Filter Kategori & Pencarian */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0">
                  {productCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-[#071A2E] text-white font-semibold'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama ikan..."
                    aria-label="Cari komoditas ikan"
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] rounded-lg text-xs border border-zinc-300 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#FAF8F5] border border-zinc-200 text-center space-y-2">
                <p className="text-xs font-medium text-zinc-700">
                  Komoditas &ldquo;{searchQuery}&rdquo; belum ditemukan.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Semua');
                  }}
                  className="text-xs font-semibold text-zinc-900 underline"
                >
                  Tampilkan Semua Komoditas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#FAF8F5] rounded-xl overflow-hidden border border-zinc-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 bg-zinc-200 relative overflow-hidden border-b border-zinc-200">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#071A2E] text-white">
                          {product.availability}
                        </span>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
                          <span className="font-medium text-sky-900">{product.category}</span>
                          <span className="italic">{product.latinName}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 mt-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-zinc-200 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] text-zinc-500 block">Harga Koperasi</span>
                        <span className="text-sm sm:text-base font-mono font-semibold tabular-nums text-zinc-900">
                          {product.pricePerKg}{' '}
                          <span className="text-xs font-normal text-zinc-500">/ kg</span>
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                          `Halo Koperasi KNMP Oepuah, saya ingin memesan ${product.name} (${product.pricePerKg}/kg).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Pesan WA</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= MENGENAL KAMI & PROFIL KAWASAN ================= */}
        <section
          id="mengenal"
          className="scroll-mt-24 py-10 sm:py-14 border-t border-zinc-200 bg-[#FAF8F5]"
        >
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
                    Profil Kawasan & Koperasi
                  </p>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                    {data.mengenalKami.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    {data.mengenalKami.subtitle}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-zinc-200">
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {data.mengenalKami.narrative}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                      <ShieldCheck className="w-4 h-4 text-sky-800" />
                      <span>Visi Utama</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      {data.mengenalKami.vision}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 sm:p-5 border border-zinc-200">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                      <Layers className="w-4 h-4 text-sky-800" />
                      <span>Misi Strategis</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-600 list-disc pl-4 leading-relaxed">
                      {data.mengenalKami.missions.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kartu Sekretariat & Kontak Koperasi */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl overflow-hidden border border-zinc-200">
                  <div className="h-48 sm:h-56 bg-zinc-200 overflow-hidden relative border-b border-zinc-200">
                    <img
                      src={data.mengenalKami.imageUrl}
                      alt="Sentra Koperasi Kampung Nelayan Oepuah"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-5 space-y-3.5">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Sekretariat & Kontak Koperasi
                    </h3>
                    <div className="space-y-3 text-xs text-zinc-600">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{data.mengenalKami.address}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-100">
                        <a
                          href={`tel:${data.mengenalKami.phone}`}
                          className="flex items-center gap-2 text-zinc-900 hover:underline font-mono tabular-nums font-medium truncate"
                        >
                          <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="truncate">{data.mengenalKami.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${cleanWaNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 shrink-0"
                        >
                          WhatsApp
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-zinc-100">
                        <a
                          href={`mailto:${data.mengenalKami.email}`}
                          className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-mono truncate"
                        >
                          <Mail className="w-4 h-4 text-zinc-800 shrink-0" />
                          <span className="truncate">{data.mengenalKami.email}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(data.mengenalKami.email)}
                          className="text-xs font-medium text-zinc-900 hover:underline shrink-0 ml-2"
                        >
                          {copiedEmail === data.mengenalKami.email ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DEWAN PENGURUS & KOORDINATOR ================= */}
        <section
          id="pengurus"
          className="scroll-mt-24 py-10 sm:py-14 border-t border-zinc-200 bg-white"
        >
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-6 sm:mb-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
                Struktur Pengelola
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                {data.pengurusSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {data.pengurusSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {data.pengurusSection.items.map((person) => {
                const hasPhone = Boolean(person.phone && person.phone.trim());
                const hasEmail = Boolean(person.email && person.email.trim());

                return (
                  <div
                    key={person.id}
                    className="bg-[#FAF8F5] rounded-xl overflow-hidden border border-zinc-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-zinc-200 overflow-hidden border-b border-zinc-200">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <span className="text-xs font-medium text-sky-800 block">
                          {person.role}
                        </span>
                        <h3 className="text-base font-semibold tracking-tight text-zinc-900 mt-1">
                          {person.name}
                        </h3>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-zinc-200 space-y-2 text-xs">
                      {hasPhone && (
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`tel:${person.phone?.replace(/[^0-9+]/g, '')}`}
                            className="text-zinc-900 hover:underline flex items-center gap-1.5 truncate font-mono tabular-nums font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="truncate">{person.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${person.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 shrink-0"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}

                      {hasEmail && (
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`mailto:${person.email}`}
                            className="text-zinc-600 hover:text-zinc-900 truncate flex items-center gap-1.5 font-mono text-[11px]"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{person.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(person.email!)}
                            className="text-zinc-900 font-medium hover:underline inline-flex items-center gap-1 shrink-0 text-xs"
                          >
                            {copiedEmail === person.email ? (
                              <>
                                <Check className="w-3 h-3" /> Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Salin
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!hasPhone && !hasEmail && (
                        <div className="text-xs text-zinc-500">
                          Pengurus Aktif Koperasi KNMP Oepuah
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= WARTA & PENGUMUMAN RESMI ================= */}
        <section
          id="pengumuman"
          className="scroll-mt-24 py-10 sm:py-14 border-t border-zinc-200 bg-[#FAF8F5]"
        >
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-800 mb-1">
                Informasi Masyarakat Nelayan
              </p>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                {data.pengumumanSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {data.pengumumanSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {data.pengumumanSection.items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden border border-zinc-200 flex flex-col justify-between"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-44 sm:h-48 bg-zinc-200 overflow-hidden relative border-b border-zinc-200">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#071A2E] text-white">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      {!item.imageUrl && (
                        <div className="flex items-center gap-2 text-xs mb-2">
                          <span className="px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-semibold border border-zinc-200">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-zinc-500 mb-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 tracking-tight">
                        {item.title}
                      </h3>

                      <p className="text-xs text-zinc-600 mt-2 leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-5 py-3.5 bg-[#FAF8F5] border-t border-zinc-200 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncement(item)}
                      className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1 py-1"
                    >
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-zinc-500">Koperasi KNMP</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= MODAL BACA WARTA LENGKAP ================= */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedAnnouncement.imageUrl && (
              <div className="h-48 sm:h-60 w-full overflow-hidden relative bg-zinc-100 border-b border-zinc-200">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-zinc-900/85 text-white flex items-center justify-center"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-4">
              {!selectedAnnouncement.imageUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center"
                    aria-label="Tutup modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-900 font-semibold border border-zinc-200">
                  {selectedAnnouncement.category}
                </span>
                <span className="font-mono tabular-nums text-zinc-500">
                  {selectedAnnouncement.date}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-900">
                {selectedAnnouncement.title}
              </h2>

              <div className="p-3.5 rounded-lg bg-[#FAF8F5] text-xs text-zinc-700 font-medium leading-relaxed border-l-2 border-zinc-900">
                {selectedAnnouncement.summary}
              </div>

              <div className="text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-line">
                {selectedAnnouncement.content || selectedAnnouncement.summary}
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500">Koperasi Nelayan Merah Putih Oepuah</span>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Tutup Warta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOMBOL KEMBALI KE ATAS ================= */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => scrollToSection('beranda')}
          className="fixed bottom-5 right-4 z-30 w-10 h-10 rounded-lg bg-[#071A2E] text-white border border-white/15 shadow-sm flex items-center justify-center"
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-4 sm:px-6 text-xs text-zinc-500">
        <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#071A2E] text-white flex items-center justify-center shrink-0">
              <Anchor className="w-3.5 h-3.5" />
            </span>
            <span className="text-zinc-700 font-medium">
              © {new Date().getFullYear()} Kampung Nelayan Merah Putih Oepuah, Kab. Timor Tengah Utara, NTT.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => scrollToSection('beranda')}
              className="hover:text-zinc-900 transition-colors"
            >
              Ke Atas ↑
            </button>
            <a href="/admin" className="hover:text-zinc-900 transition-colors">
              Panel Pengelola
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
