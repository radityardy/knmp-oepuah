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
  TrendingUp,
  Users,
  Waves,
  X,
} from 'lucide-react';

type SectionKey = 'beranda' | 'produk' | 'mengenal' | 'pengurus' | 'pengumuman';

const NAV_SECTIONS: {
  key: SectionKey;
  label: string;
  shortLabel: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'beranda', label: 'Beranda & Metrik', shortLabel: 'Beranda', code: '01', icon: Home },
  { key: 'produk', label: 'Katalog Komoditas', shortLabel: 'Komoditas', code: '02', icon: Fish },
  { key: 'mengenal', label: 'Profil Kawasan', shortLabel: 'Profil', code: '03', icon: Info },
  { key: 'pengurus', label: 'Dewan Pengurus', shortLabel: 'Pengurus', code: '04', icon: Users },
  { key: 'pengumuman', label: 'Warta Resmi', shortLabel: 'Warta', code: '05', icon: Calendar },
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

  // Scroll-Spy otomatis mendeteksi seksi aktif saat pengunjung scroll halaman SPA ke bawah
  useEffect(() => {
    if (!data) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBackToTop(scrollY > 520);

      const viewportOffset = 180;
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
      const headerOffset = 104;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, elementPosition - headerOffset);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-3 px-4 text-center">
        <div className="w-9 h-9 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shadow-sm">
          <Anchor className="w-4 h-4 animate-pulse" />
        </div>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Memuat Portal Maritim KNMP Oepuah...
        </p>
      </div>
    );
  }

  const cleanWaNumber = data.mengenalKami.phone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF8F5] text-zinc-900 flex flex-col antialiased selection:bg-[#071A2E] selection:text-white pb-20 md:pb-0">
      {/* ================= STICKY TOP BAR (SPA SCROLL NAVIGATION) ================= */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-zinc-200/90">
        <div className="max-w-[1160px] mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <button
            type="button"
            onClick={() => scrollToSection('beranda')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 rounded-lg"
          >
            <span className="w-8 h-8 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shrink-0 border border-white/10 transition-transform duration-150 group-active:scale-95">
              <Anchor className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold tracking-tight text-zinc-900 leading-tight">
                KNMP Oepuah
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 leading-tight">
                TTU • NTT
              </span>
            </div>
          </button>

          {/* Desktop Smooth-Scroll Links */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-1 bg-zinc-100/90 p-1 rounded-lg border border-zinc-200/80"
          >
            {NAV_SECTIONS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => scrollToSection(item.key)}
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-zinc-900 font-semibold shadow-sm border border-zinc-200/80'
                      : 'text-zinc-600 hover:text-zinc-900 font-medium'
                  }`}
                >
                  <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                    {item.code}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href={`https://wa.me/${cleanWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 transition-colors duration-150 active:scale-[0.99]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hubungi Koperasi</span>
            </a>
            <button
              type="button"
              onClick={() => scrollToSection('produk')}
              className="inline-flex items-center gap-1.5 bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors duration-150 active:scale-[0.99]"
            >
              <span>Katalog Ikan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Actions: Quick WA + Drawer Button */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`https://wa.me/${cleanWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/90 inline-flex items-center gap-1.5 active:scale-[0.99]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>WA Koperasi</span>
            </a>

            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-lg bg-white border border-zinc-200 text-zinc-900 flex items-center justify-center transition-colors duration-150 hover:bg-zinc-50 active:scale-95"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick-Jump Scroll Bar (Agar di HP bisa langsung tap seksi tanpa buka drawer) */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar px-4 py-2 gap-1.5 border-t border-zinc-200/70 bg-white/80">
          {NAV_SECTIONS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollToSection(item.key)}
                className={`px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap transition-colors duration-150 shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#071A2E] text-white font-semibold'
                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200/70 font-medium'
                }`}
              >
                <span className="font-mono text-[10px] opacity-70 tabular-nums">{item.code}</span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ================= MOBILE SLIDE-OUT DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200 md:hidden ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside
        aria-label="Menu Samping Mobile"
        className={`fixed top-0 bottom-0 right-0 z-50 w-[300px] max-w-[85vw] bg-[#FAF8F5] border-l border-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out md:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shrink-0">
                <Anchor className="w-3.5 h-3.5 stroke-[2.2]" />
              </span>
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 leading-tight">KNMP Oepuah</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Navigasi Cepat SPA
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center transition-colors hover:bg-zinc-200 active:scale-95"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Lompat ke Seksi Halaman
            </p>
            {NAV_SECTIONS.map((item) => {
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => scrollToSection(item.key)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#071A2E] text-white font-semibold'
                      : 'text-zinc-800 hover:bg-zinc-200/60 active:bg-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] opacity-75 tabular-nums">{item.code}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-200 bg-white space-y-2.5">
          <a
            href={`https://wa.me/${cleanWaNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Pengurus (WhatsApp)</span>
          </a>

          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200/80 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Panel Pengelola (CMS)</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>

          <div className="text-[10px] font-mono text-zinc-500 text-center pt-1">
            © {new Date().getFullYear()} KNMP Oepuah • TTU, NTT
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTINUOUS SPA CONTENT ================= */}
      <main className="flex-1">
        {/* ================= 01. BERANDA & METRIK OPERASIONAL ================= */}
        <section id="beranda" className="scroll-mt-24">
          {/* Deep Maritime Timor Hero */}
          <div className="bg-[#071A2E] text-white pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 border-b border-white/10">
            <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 min-w-0 space-y-4 sm:space-y-6">
                <div className="inline-flex max-w-full items-center gap-2 px-3 py-1 rounded-md bg-white/[0.06] border border-white/[0.12] text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-sky-200 overflow-hidden">
                  <Waves className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{data.beranda.eyebrow}</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight leading-[1.15] text-white text-balance">
                  {data.beranda.title}
                </h1>

                <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {data.beranda.description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('produk')}
                    className="bg-white text-[#071A2E] hover:bg-zinc-100 px-4 sm:px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-[0.99] inline-flex items-center gap-2"
                  >
                    <Fish className="w-3.5 h-3.5 text-sky-700" />
                    <span>Jelajahi Komoditas Laut</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('mengenal')}
                    className="px-4 sm:px-5 py-2.5 rounded-lg text-xs font-medium text-white border border-white/20 hover:bg-white/10 transition-colors duration-150 active:scale-[0.99] inline-flex items-center gap-1.5"
                  >
                    <span>Profil & Sekretariat</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Kartu Ekosistem Laut Sawu dengan Hyperlink Lokasi */}
              <div className="lg:col-span-5">
                {data.beranda.heroImageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-white/15 bg-[#0B2540]">
                    <a
                      href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[11px] text-slate-300 px-4 py-3 bg-[#061526] border-b border-white/10 hover:text-sky-300 transition-colors group"
                      title="Buka Titik Koordinat Peta Perairan Oepuah"
                    >
                      <span className="font-medium text-white group-hover:text-sky-300 flex items-center gap-1.5 truncate">
                        <Fish className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-[10px] text-sky-300 inline-flex items-center gap-1 shrink-0 group-hover:underline">
                        {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </a>
                    <img
                      src={data.beranda.heroImageUrl}
                      alt="Kawasan Pesisir Kampung Nelayan Oepuah"
                      className="w-full h-[260px] sm:h-[280px] object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#0B2540] border border-white/15 p-4 sm:p-5">
                    <a
                      href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 text-[11px] text-slate-300 pb-3.5 mb-3.5 border-b border-white/10 hover:text-sky-300 transition-colors group"
                      title="Buka Titik Koordinat Peta Perairan Oepuah"
                    >
                      <span className="font-medium text-white group-hover:text-sky-300 flex items-center gap-1.5 truncate">
                        <Fish className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                      </span>
                      <span className="font-mono tabular-nums text-[10px] text-sky-300 inline-flex items-center gap-1 shrink-0 group-hover:underline">
                        {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </a>

                    <svg
                      viewBox="0 0 400 220"
                      className="w-full h-auto rounded-lg bg-[#051324] border border-white/5"
                      role="img"
                      aria-label="Ilustrasi zona tangkap komoditas pelagis dan demersal Oepuah"
                    >
                      <defs>
                        <linearGradient id="oceanDepth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0D3562" />
                          <stop offset="100%" stopColor="#041020" />
                        </linearGradient>
                      </defs>
                      <rect width="400" height="220" fill="url(#oceanDepth)" />
                      <line x1="0" y1="55" x2="400" y2="55" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="400" y2="110" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />
                      <line x1="0" y1="165" x2="400" y2="165" stroke="#ffffff" strokeOpacity="0.06" strokeDasharray="3 3" />

                      <path d="M0 24 Q100 12 200 24 T400 24 L400 0 L0 0 Z" fill="#38BDF8" fillOpacity="0.14" />

                      {/* Red Snapper */}
                      <g transform="translate(70, 75)">
                        <path d="M115 30 L148 10 L140 30 L148 50 Z" fill="#E11D48" />
                        <path d="M35 12 Q65 -8 92 12 Z" fill="#BE123C" />
                        <ellipse cx="64" cy="30" rx="58" ry="22" fill="#F43F5E" />
                        <ellipse cx="60" cy="34" rx="46" ry="13" fill="#FDA4AF" fillOpacity="0.45" />
                        <circle cx="22" cy="25" r="4" fill="#FFFFFF" />
                        <circle cx="21" cy="25" r="2" fill="#071A2E" />
                      </g>

                      {/* Yellowfin Tuna */}
                      <g transform="translate(215, 36) scale(0.75)">
                        <path d="M105 26 L135 6 L127 26 L135 46 Z" fill="#F59E0B" />
                        <ellipse cx="58" cy="26" rx="52" ry="18" fill="#38BDF8" />
                        <ellipse cx="58" cy="31" rx="44" ry="10" fill="#E0F2FE" fillOpacity="0.6" />
                        <circle cx="20" cy="23" r="4" fill="#FFFFFF" />
                        <circle cx="19" cy="23" r="2" fill="#071A2E" />
                      </g>

                      {/* Skipjack */}
                      <g transform="translate(45, 145) scale(0.65)">
                        <path d="M95 22 L122 6 L115 22 L122 38 Z" fill="#0284C7" />
                        <ellipse cx="52" cy="22" rx="46" ry="16" fill="#7DD3FC" />
                        <circle cx="18" cy="19" r="3.5" fill="#071A2E" />
                      </g>

                      <path d="M0 202 Q110 188 220 204 T400 196 L400 220 L0 220 Z" fill="#030B16" />
                    </svg>

                    <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="font-mono">WPPNRI 573 • Laut Sawu</span>
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Rantai Dingin Aktif
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Swiss Grid Operational Metrics */}
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6 -mt-8 sm:-mt-10 pb-12 sm:pb-16">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-zinc-200/90 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                       SEKSI 01
                    </span>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900">
                      {data.beranda.statsTitle}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">{data.beranda.statsSubtitle}</p>
                </div>
                <span className="text-[11px] font-mono text-zinc-600 flex items-center gap-1.5 self-start sm:self-auto bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200/80">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Data Terverifikasi Koperasi</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mt-4">
                {data.beranda.stats.map((stat, idx) => (
                  <div
                    key={stat.id}
                    className="p-4 rounded-lg bg-[#FAF8F5]/70 border border-zinc-200/80 flex flex-col justify-between hover:border-zinc-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          {stat.label}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                          0{idx + 1}
                        </span>
                      </div>

                      <div className="text-xl sm:text-2xl font-mono font-semibold tabular-nums tracking-tight text-zinc-900 my-2">
                        {stat.value}
                        {stat.unit && (
                          <span className="text-xs sm:text-sm font-mono font-normal text-zinc-500 ml-1">
                            {stat.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-zinc-200/60 space-y-1.5">
                      {stat.trendLabel && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {stat.trendLabel}
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-600 block leading-snug">
                        {stat.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 02. KATALOG KOMODITAS LAUT ================= */}
        <section
          id="produk"
          className="scroll-mt-24 py-12 sm:py-16 border-t border-zinc-200/80 bg-white"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    SEKSI 02
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    Hasil Tangkapan Harian
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                  {data.produkSection.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {data.produkSection.subtitle}
                </p>
              </div>

              {/* Filter Kategori & Pencarian Cepat */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 sm:pb-0">
                  {productCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70 border border-zinc-200/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari komoditas / nama latin..."
                    aria-label="Cari komoditas ikan"
                    className="w-full pl-8 pr-3 py-1.5 bg-[#FAF8F5] rounded-lg text-xs border border-zinc-300 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#FAF8F5] border border-zinc-200 text-center space-y-2">
                <p className="text-xs font-medium text-zinc-700">
                  Tidak ada komoditas yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#FAF8F5] rounded-xl overflow-hidden border border-zinc-200/90 flex flex-col justify-between hover:border-zinc-300 transition-colors"
                  >
                    <div>
                      <div className="h-44 sm:h-48 bg-zinc-200 relative overflow-hidden border-b border-zinc-200/80">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-zinc-900/90 text-white">
                          {product.availability}
                        </span>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                          <span className="font-mono uppercase tracking-wider text-zinc-600">
                            {product.category}
                          </span>
                          <span className="italic font-serif">{product.latinName}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 mt-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-zinc-200/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-mono">
                          Harga Koperasi
                        </span>
                        <span className="text-sm sm:text-base font-mono font-semibold tabular-nums text-zinc-900">
                          {product.pricePerKg}{' '}
                          <span className="text-xs font-normal text-zinc-500">/ kg</span>
                        </span>
                      </div>
                      <a
                        href={`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
                          `Halo Koperasi KNMP Oepuah, saya tertarik memesan komoditas ${product.name} (${product.pricePerKg}/kg).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors inline-flex items-center gap-1"
                      >
                        <span>Pesan WA</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 03. MENGENAL KAMI & PROFIL KAWASAN ================= */}
        <section
          id="mengenal"
          className="scroll-mt-24 py-12 sm:py-16 border-t border-zinc-200/80 bg-[#FAF8F5]"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                      SEKSI 03
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Profil Kawasan & Tata Kelola
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                    {data.mengenalKami.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                    {data.mengenalKami.subtitle}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5 sm:p-6 border border-zinc-200/90">
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                    {data.mengenalKami.narrative}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-zinc-200/90">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                      <ShieldCheck className="w-4 h-4 text-sky-700" />
                      <span>Visi Utama</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                      {data.mengenalKami.vision}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-zinc-200/90">
                    <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 mb-2">
                      <Layers className="w-4 h-4 text-sky-700" />
                      <span>Misi Strategis</span>
                    </div>
                    <ul className="space-y-2 text-xs text-zinc-600 list-disc pl-4 leading-relaxed">
                      {data.mengenalKami.missions.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Kartu Sekretariat & Kontak Koperasi */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-xl overflow-hidden border border-zinc-200/90 lg:sticky lg:top-24">
                  <div className="h-52 sm:h-60 bg-zinc-200 overflow-hidden relative border-b border-zinc-200/80">
                    <img
                      src={data.mengenalKami.imageUrl}
                      alt="Sentra Koperasi Kampung Nelayan Oepuah"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-zinc-900/85 text-white text-[10px] font-mono uppercase tracking-wider">
                      Sentra Koperasi Oepuah
                    </span>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Sekretariat & Kontak Operasional
                    </h3>
                    <div className="space-y-3 text-xs text-zinc-600">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{data.mengenalKami.address}</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
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
                          className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0"
                        >
                          Chat WA
                        </a>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                        <a
                          href={`mailto:${data.mengenalKami.email}`}
                          className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-mono truncate"
                        >
                          <Mail className="w-4 h-4 text-zinc-900 shrink-0" />
                          <span className="truncate">{data.mengenalKami.email}</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(data.mengenalKami.email)}
                          className="text-[11px] font-mono font-medium text-zinc-900 hover:underline shrink-0 ml-2"
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

        {/* ================= 04. DEWAN PENGURUS & KOORDINATOR ================= */}
        <section
          id="pengurus"
          className="scroll-mt-24 py-12 sm:py-16 border-t border-zinc-200/80 bg-white"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-6 sm:mb-8">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  SEKSI 04
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Struktur Organisasi Koperasi
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                {data.pengurusSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {data.pengurusSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.pengurusSection.items.map((person) => {
                const hasPhone = Boolean(person.phone && person.phone.trim());
                const hasEmail = Boolean(person.email && person.email.trim());

                return (
                  <div
                    key={person.id}
                    className="bg-[#FAF8F5] rounded-xl overflow-hidden border border-zinc-200/90 flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-zinc-200 overflow-hidden border-b border-zinc-200/80">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/80">
                          {person.role}
                        </span>
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 mt-2">
                          {person.name}
                        </h3>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-3.5 bg-white border-t border-zinc-200/80 space-y-2 text-xs">
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
                            className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 shrink-0"
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
                            className="text-zinc-900 font-mono font-medium hover:underline inline-flex items-center gap-1 shrink-0 text-[11px]"
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
                        <div className="text-[11px] font-mono text-zinc-500">
                          Koordinator Operasional KNMP Oepuah
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= 05. WARTA & PENGUMUMAN RESMI ================= */}
        <section
          id="pengumuman"
          className="scroll-mt-24 py-12 sm:py-16 border-t border-zinc-200/80 bg-[#FAF8F5]"
        >
          <div className="max-w-[1160px] mx-auto px-4 sm:px-6">
            <div className="mb-6 sm:mb-8 max-w-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                  SEKSI 05
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Warta Maritim & Informasi Koperasi
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                {data.pengumumanSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {data.pengumumanSection.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {data.pengumumanSection.items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden border border-zinc-200/90 flex flex-col justify-between hover:border-zinc-300 transition-colors group"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-44 sm:h-52 bg-zinc-200 overflow-hidden relative border-b border-zinc-200/80">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-zinc-900/90 text-white">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {!item.imageUrl && (
                        <div className="flex items-center gap-2 text-[11px] mb-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono uppercase tracking-wider font-semibold border border-zinc-200">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-zinc-500 mb-2">
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

                  <div className="px-4 sm:px-6 py-3.5 bg-[#FAF8F5] border-t border-zinc-200/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedAnnouncement(item)}
                      className="text-xs font-semibold text-zinc-900 hover:underline inline-flex items-center gap-1 py-1"
                    >
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500">Koperasi KNMP</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ================= MODAL BACA ARTIKEL WARTA LENGKAP ================= */}
      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedAnnouncement.imageUrl && (
              <div className="h-48 sm:h-64 w-full overflow-hidden relative bg-zinc-100 border-b border-zinc-200">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-zinc-900 text-white flex items-center justify-center transition-colors"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-5 sm:p-7 space-y-4">
              {!selectedAnnouncement.imageUrl && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
                    aria-label="Tutup modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-900 font-mono uppercase tracking-wider font-semibold border border-zinc-200">
                  {selectedAnnouncement.category}
                </span>
                <span className="font-mono tabular-nums text-zinc-500">
                  {selectedAnnouncement.date}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900">
                {selectedAnnouncement.title}
              </h2>

              <div className="p-3.5 rounded-lg bg-[#FAF8F5] text-xs text-zinc-700 font-medium leading-relaxed border-l-2 border-zinc-900">
                {selectedAnnouncement.summary}
              </div>

              <div className="text-xs sm:text-sm text-zinc-800 leading-relaxed whitespace-pre-line pt-1">
                {selectedAnnouncement.content || selectedAnnouncement.summary}
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  Dewan Koperasi Nelayan Merah Putih Oepuah
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Tutup Warta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOMBOL KEMBALI KE ATAS (FLOATING) ================= */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => scrollToSection('beranda')}
          className="fixed bottom-20 md:bottom-6 right-4 z-30 w-10 h-10 rounded-lg bg-[#071A2E] hover:bg-[#0D2847] text-white border border-white/15 shadow-sm flex items-center justify-center transition-transform active:scale-95"
          aria-label="Kembali ke atas"
          title="Kembali ke atas"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* ================= STICKY BOTTOM NAVIGATION BAR KHUSUS MOBILE (HP) ================= */}
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 md:hidden px-2 py-1.5 grid grid-cols-5 gap-1"
      >
        {NAV_SECTIONS.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => scrollToSection(item.key)}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-[#071A2E] bg-zinc-100 font-semibold' : 'text-zinc-500 font-medium'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-[#071A2E]' : 'text-zinc-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full px-1">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-200 bg-white py-8 px-4 sm:px-6 text-xs text-zinc-500">
        <div className="max-w-[1160px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded bg-[#071A2E] text-white flex items-center justify-center">
              <Anchor className="w-3.5 h-3.5" />
            </span>
            <span className="text-zinc-700 font-medium">
              © {new Date().getFullYear()} Kampung Nelayan Merah Putih Oepuah, Kab. Timor Tengah Utara, NTT.
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <button
              type="button"
              onClick={() => scrollToSection('beranda')}
              className="hover:text-zinc-900 transition-colors"
            >
              Ke Atas ↑
            </button>
            <a href="/admin" className="hover:text-zinc-900 transition-colors">
              Panel Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
