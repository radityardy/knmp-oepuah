'use client';

import React, { useEffect, useState } from 'react';
import { AnnouncementItem, CmsData } from '@/types/cms';
import {
  Anchor,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Fish,
  Home,
  Info,
  Layers,
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

type TabKey = 'beranda' | 'pengurus' | 'mengenal' | 'produk' | 'pengumuman';

export default function PublicPortalPage() {
  const [data, setData] = useState<CmsData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/cms')
      .then((res) => res.json())
      .then((resData: CmsData) => setData(resData));
  }, []);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center text-xs font-medium text-[#86868B] tracking-tight">
        Memuat Portal Kampung Nelayan Merah Putih Oepuah...
      </div>
    );
  }

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'beranda', label: 'Beranda Utama', icon: Home },
    { key: 'pengurus', label: 'Dewan Pengurus', icon: Users },
    { key: 'mengenal', label: 'Mengenal Kami', icon: Info },
    { key: 'produk', label: 'Katalog Komoditas', icon: Fish },
    { key: 'pengumuman', label: 'Warta & Pengumuman', icon: Calendar },
  ];

  const filteredProducts = data.produkSection.items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased selection:bg-[#0071E3] selection:text-white">
      {/* Global Navigation Bar — Apple Translucent Header (Satu baris ramping, tanpa tumpukan pill) */}
      <header className="sticky top-0 z-40 bg-[#F5F5F7]/95 backdrop-blur-xl border-b border-black/[0.08] shadow-sm">
        <div className="max-w-[1120px] mx-auto h-14 px-4 sm:px-5 flex items-center justify-between">
          <button
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <span className="w-7 h-7 rounded-lg bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Anchor className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold tracking-tight text-[#1D1D1F] leading-tight">
                KNMP Oepuah
              </span>
              <span className="text-[10px] text-[#86868B] leading-tight sm:hidden">
                Kab. Timor Tengah Utara
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`text-xs transition-colors relative py-3.5 ${
                    isActive
                      ? 'text-[#1D1D1F] font-semibold'
                      : 'text-[#86868B] hover:text-[#1D1D1F] font-normal'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1D1D1F]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Katalog Button */}
          <button
            onClick={() => setActiveTab('produk')}
            className="hidden md:inline-flex bg-[#0071E3] hover:bg-[#0077ED] text-white text-[11px] font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm"
          >
            Katalog Komoditas
          </button>

          {/* Mobile Actions: WhatsApp Link & Tombol Hamburger Sidebar */}
          <div className="flex md:hidden items-center gap-2">
            <a
              href={`https://wa.me/${data.mengenalKami.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1 active:bg-emerald-100"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-black/[0.1] text-[#1D1D1F] flex items-center justify-center transition hover:bg-gray-50 active:scale-95 shadow-sm"
              aria-label="Buka Menu Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SIDEBAR DRAWER (GESER NYAMPING) ================= */}
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Slide-out Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out md:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Top Header */}
          <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-[#F5F5F7]">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#0A2540] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Anchor className="w-3.5 h-3.5 stroke-[2.2]" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#1D1D1F] leading-tight">KNMP Oepuah</h3>
                <span className="text-[10px] text-[#86868B] leading-tight">Navigasi Portal</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-8 h-8 rounded-full bg-white border border-black/[0.08] text-gray-700 flex items-center justify-center transition hover:bg-gray-100 active:scale-95 shadow-sm"
              aria-label="Tutup Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-[#86868B] uppercase">
              Menu Halaman
            </p>
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveTab(item.key);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#0071E3] text-white shadow-sm'
                      : 'text-[#1D1D1F] hover:bg-[#F5F5F7] active:bg-[#EBEBEF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#86868B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer Info & Actions */}
        <div className="p-4 border-t border-black/[0.06] bg-[#FAFAFC] space-y-2.5">
          <a
            href={`https://wa.me/${data.mengenalKami.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Hubungi Pengurus (WA)</span>
          </a>

          <a
            href="/admin"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium text-[#515154] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition"
          >
            <span>Masuk ke Panel Pengelola</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>

          <div className="text-[10px] text-[#86868B] text-center leading-relaxed pt-1 border-t border-black/[0.04]">
            © {new Date().getFullYear()} KNMP Oepuah, Biboki Moenleu, TTU
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <div key={activeTab} className="animate-tab-switch">
          {/* ================= 1. BERANDA ================= */}
          {activeTab === 'beranda' && (
          <div>
            {/* Deep Maritime Hero Section */}
            <section className="bg-[#071D36] text-white pt-6 sm:pt-16 pb-12 sm:pb-24 px-4 sm:px-5 border-b border-white/10">
              <div className="max-w-[1120px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-7 space-y-3.5 sm:space-y-6">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-blue-200">
                    <Waves className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{data.beranda.eyebrow}</span>
                  </div>

                  <h1 className="text-xl sm:text-3xl md:text-5xl font-semibold tracking-[-0.025em] leading-[1.2] sm:leading-[1.15]">
                    {data.beranda.title}
                  </h1>

                  <p className="text-[13px] sm:text-[16px] text-slate-300 leading-relaxed max-w-2xl font-normal">
                    {data.beranda.description}
                  </p>

                  <div className="pt-1 flex flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => setActiveTab('produk')}
                      className="flex-1 sm:flex-initial bg-white text-[#071D36] hover:bg-slate-100 px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-semibold transition shadow-sm text-center"
                    >
                      Lihat Komoditas
                    </button>
                    <button
                      onClick={() => setActiveTab('mengenal')}
                      className="flex-1 sm:flex-initial px-3.5 sm:px-5 py-2.5 rounded-full text-xs font-medium text-white border border-white/20 hover:bg-white/10 transition inline-flex items-center justify-center gap-1 text-center"
                    >
                      <span>Mengenal Oepuah</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Ikan di Laut / Banner Kanan (dengan Header Hyperlink Dinamis) */}
                <div className="lg:col-span-5">
                  {data.beranda.heroImageUrl ? (
                    <div className="rounded-2xl overflow-hidden border border-white/15 bg-[#0B294B] shadow-2xl">
                      {/* Header Hyperlink di atas foto custom */}
                      <a
                        href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-[11px] text-slate-300 px-4 py-3 bg-[#071D36]/90 border-b border-white/10 hover:text-sky-300 transition group"
                        title="Klik untuk membuka peta atau tautan lokasi"
                      >
                        <span className="font-medium text-white group-hover:text-sky-300 flex items-center gap-1.5 transition">
                          <Fish className="w-3.5 h-3.5 text-sky-400" />
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                        <span className="font-mono text-[10px] text-sky-300 inline-flex items-center gap-1 group-hover:underline">
                          {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </a>
                      <img
                        src={data.beranda.heroImageUrl}
                        alt="Kampung Nelayan Oepuah"
                        className="w-full h-[280px] object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#0B294B] border border-white/15 p-6 shadow-2xl">
                      {/* HYPERLINK HEADER: Bisa diklik dan diedit admin */}
                      <a
                        href={data.beranda.heroCardLink || 'https://maps.google.com/?q=-9.15,124.58'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-[11px] text-slate-300 pb-4 mb-4 border-b border-white/10 hover:text-sky-300 transition group"
                        title="Buka Peta Lokasi / Informasi Ekosistem (Klik)"
                      >
                        <span className="font-medium text-white group-hover:text-sky-300 flex items-center gap-1.5 transition">
                          <Fish className="w-3.5 h-3.5 text-sky-400" />
                          {data.beranda.heroCardTitle || 'Ekosistem Perairan Laut Sawu — Oepuah'}
                        </span>
                        <span className="font-mono text-[10px] text-sky-300 inline-flex items-center gap-1 group-hover:underline">
                          {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </a>

                      {/* Clean Vector Illustration of Fish in the Ocean */}
                      <svg viewBox="0 0 400 240" className="w-full h-auto rounded-xl bg-[#06182E]">
                        <defs>
                          <linearGradient id="oceanDepth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0E3A6C" />
                            <stop offset="100%" stopColor="#051326" />
                          </linearGradient>
                        </defs>
                        <rect width="400" height="240" fill="url(#oceanDepth)" />
                        <line x1="0" y1="60" x2="400" y2="60" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="4 4" />
                        <line x1="0" y1="120" x2="400" y2="120" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="4 4" />
                        <line x1="0" y1="180" x2="400" y2="180" stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="4 4" />

                        <path d="M0 28 Q100 14 200 28 T400 28 L400 0 L0 0 Z" fill="#38BDF8" fillOpacity="0.15" />

                        {/* Main Fish 1: Red Snapper */}
                        <g transform="translate(75, 85)">
                          <path d="M115 30 L148 10 L140 30 L148 50 Z" fill="#E11D48" />
                          <path d="M35 12 Q65 -8 92 12 Z" fill="#BE123C" />
                          <ellipse cx="64" cy="30" rx="58" ry="23" fill="#F43F5E" />
                          <ellipse cx="60" cy="34" rx="46" ry="14" fill="#FDA4AF" fillOpacity="0.45" />
                          <circle cx="22" cy="25" r="4" fill="#FFFFFF" />
                          <circle cx="21" cy="25" r="2" fill="#071D36" />
                        </g>

                        {/* Main Fish 2: Yellowfin Tuna */}
                        <g transform="translate(215, 42) scale(0.75)">
                          <path d="M105 26 L135 6 L127 26 L135 46 Z" fill="#F59E0B" />
                          <ellipse cx="58" cy="26" rx="52" ry="18" fill="#38BDF8" />
                          <ellipse cx="58" cy="31" rx="44" ry="10" fill="#E0F2FE" fillOpacity="0.6" />
                          <circle cx="20" cy="23" r="4" fill="#FFFFFF" />
                          <circle cx="19" cy="23" r="2" fill="#071D36" />
                        </g>

                        {/* Main Fish 3: Skipjack */}
                        <g transform="translate(45, 155) scale(0.65)">
                          <path d="M95 22 L122 6 L115 22 L122 38 Z" fill="#0284C7" />
                          <ellipse cx="52" cy="22" rx="46" ry="16" fill="#7DD3FC" />
                          <circle cx="18" cy="19" r="3.5" fill="#071D36" />
                        </g>

                        <path d="M0 218 Q110 202 220 220 T400 212 L400 240 L0 240 Z" fill="#040E1C" />
                      </svg>

                      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Komoditas: Kakap Merah, Tuna, Cakalang</span>
                        <span className="text-emerald-400 font-medium">Zona Tangkap Aktif</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Bento Grid Metrics */}
            <section className="max-w-[1120px] mx-auto px-4 sm:px-5 -mt-8 sm:-mt-10 pb-14 sm:pb-20">
              <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-black/[0.08] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 sm:pb-6 border-b border-black/[0.06]">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#1D1D1F]">
                      {data.beranda.statsTitle}
                    </h2>
                    <p className="text-xs text-[#86868B] mt-0.5">{data.beranda.statsSubtitle}</p>
                  </div>
                  <span className="text-[11px] font-medium text-[#0071E3] flex items-center gap-1 self-start sm:self-auto">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Data Koperasi KNMP Oepuah
                  </span>
                </div>

                {/* Grid Kartu Metrik Fleksibel (Bisa 4, 5, atau lebih kartu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                  {data.beranda.stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="p-4 sm:p-5 rounded-xl bg-[#F5F5F7] border border-black/[0.05] flex flex-col justify-between hover:bg-[#EFEFF2] transition-colors shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#86868B]">{stat.label}</span>
                          {stat.trendLabel && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {stat.trendLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] my-2 sm:my-2.5">
                          {stat.value}
                          {stat.unit && (
                            <span className="text-base sm:text-lg font-normal text-[#86868B] ml-1.5">
                              {stat.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#86868B] block leading-relaxed pt-2 border-t border-black/[0.04]">
                        {stat.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= 2. PENGURUS ================= */}
        {activeTab === 'pengurus' && (
          <section className="max-w-[1120px] mx-auto px-4 sm:px-5 py-8 sm:py-14">
            <div className="max-w-2xl mb-6 sm:mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0071E3] mb-1.5">
                ORGANISASI & TATA KELOLA
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                {data.pengurusSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 sm:mt-2">{data.pengurusSection.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.pengurusSection.items.map((person) => {
                const hasPhone = Boolean(person.phone && person.phone.trim());
                const hasEmail = Boolean(person.email && person.email.trim());

                return (
                  <div
                    key={person.id}
                    className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="aspect-[4/3] bg-[#E8E8ED] overflow-hidden">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 sm:p-6">
                        <span className="text-[11px] font-medium text-[#0071E3] uppercase tracking-wider">
                          {person.role}
                        </span>
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#1D1D1F] mt-1">
                          {person.name}
                        </h3>
                      </div>
                    </div>

                    {/* Contact Bar: Fleksibel dan dinamis sesuai isian admin */}
                    <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FAFAFC] border-t border-black/[0.06] space-y-2 text-xs">
                      {hasPhone && (
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`tel:${person.phone?.replace(/[^0-9+]/g, '')}`}
                            className="text-[#1D1D1F] hover:text-[#0071E3] flex items-center gap-1.5 truncate transition font-medium"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{person.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/${person.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 shrink-0"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}

                      {hasEmail && (
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={`mailto:${person.email}`}
                            className="text-[#86868B] hover:text-[#1D1D1F] truncate flex items-center gap-1.5"
                          >
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{person.email}</span>
                          </a>
                          <button
                            onClick={() => handleCopyEmail(person.email!)}
                            className="text-[#0071E3] font-medium hover:underline inline-flex items-center gap-1 shrink-0 text-[11px]"
                          >
                            {copiedEmail === person.email ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Salin
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {!hasPhone && !hasEmail && (
                        <div className="text-[11px] text-[#86868B] italic">
                          Pengurus Aktif Koperasi Nelayan Merah Putih
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= 3. MENGENAL KAMI ================= */}
        {activeTab === 'mengenal' && (
          <section className="max-w-[1120px] mx-auto px-4 sm:px-5 py-8 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0071E3] mb-1.5">
                    PROFIL KAWASAN
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                    {data.mengenalKami.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#86868B] mt-1.5">{data.mengenalKami.subtitle}</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-black/[0.08] shadow-sm">
                  <p className="text-xs sm:text-sm text-[#1D1D1F]/90 leading-relaxed whitespace-pre-line">
                    {data.mengenalKami.narrative}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.08] shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0071E3] mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Visi Utama</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#1D1D1F] leading-relaxed font-medium">
                      {data.mengenalKami.vision}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.08] shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0071E3] mb-2">
                      <Layers className="w-4 h-4" />
                      <span>Misi Strategis</span>
                    </div>
                    <ul className="space-y-2 text-xs text-[#515154] list-disc pl-4 leading-relaxed">
                      {data.mengenalKami.missions.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card Sekretariat & Kontak: Sepenuhnya diedit admin */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm lg:sticky lg:top-20">
                  <div className="h-52 sm:h-64 bg-[#E8E8ED] overflow-hidden relative">
                    <img
                      src={data.mengenalKami.imageUrl}
                      alt="Pesisir Oepuah"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-[#1D1D1F]">
                      Sekretariat & Sentra Koperasi
                    </h3>
                    <div className="space-y-3 text-xs text-[#515154]">
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{data.mengenalKami.address}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`tel:${data.mengenalKami.phone}`}
                          className="flex items-center gap-2 hover:text-[#0071E3] transition font-medium truncate"
                        >
                          <Phone className="w-4 h-4 text-[#0071E3] shrink-0" />
                          <span className="truncate">{data.mengenalKami.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${data.mengenalKami.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 hover:bg-emerald-100 transition shrink-0"
                        >
                          WhatsApp
                        </a>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={`mailto:${data.mengenalKami.email}`}
                          className="flex items-center gap-2 hover:text-[#0071E3] transition truncate"
                        >
                          <Mail className="w-4 h-4 text-[#0071E3] shrink-0" />
                          <span className="truncate">{data.mengenalKami.email}</span>
                        </a>
                        <button
                          onClick={() => handleCopyEmail(data.mengenalKami.email)}
                          className="text-[11px] font-medium text-[#0071E3] hover:underline shrink-0 ml-2"
                        >
                          {copiedEmail === data.mengenalKami.email ? 'Tersalin' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= 4. PRODUK KAMI ================= */}
        {activeTab === 'produk' && (
          <section className="max-w-[1120px] mx-auto px-4 sm:px-5 py-8 sm:py-14">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0071E3] mb-1.5">
                  HASIL TANGKAPAN NELAYAN
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                  {data.produkSection.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#86868B] mt-1">{data.produkSection.subtitle}</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama ikan atau kategori..."
                  className="w-full pl-9 pr-3.5 py-2.5 sm:py-2 bg-white rounded-full text-xs border border-black/[0.12] focus:outline-none focus:border-[#0071E3]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="h-44 sm:h-48 bg-[#E8E8ED] relative overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/75 text-white backdrop-blur-md">
                        {product.availability}
                      </span>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between text-[11px] text-[#86868B]">
                        <span>{product.category}</span>
                        <span className="italic">{product.latinName}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] mt-1">{product.name}</h3>
                      <p className="text-xs text-[#515154] mt-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#86868B] block">Harga Koperasi</span>
                      <span className="text-sm sm:text-base font-semibold text-[#1D1D1F]">
                        {product.pricePerKg}{' '}
                        <span className="text-xs font-normal text-[#86868B]">/ kg</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#0071E3]">Rantai Dingin</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= 5. PENGUMUMAN / BLOG ================= */}
        {activeTab === 'pengumuman' && (
          <section className="max-w-[1120px] mx-auto px-4 sm:px-5 py-8 sm:py-14">
            <div className="mb-6 sm:mb-10 max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0071E3] mb-1.5">
                WARTA & INFORMASI PUBLIK
              </p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F]">
                {data.pengumumanSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#86868B] mt-1">{data.pengumumanSection.subtitle}</p>
            </div>

            {/* Grid Kartu Pengumuman / Warta Blog */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {data.pengumumanSection.items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-44 sm:h-52 bg-[#E8E8ED] overflow-hidden relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-[#1D1D1F] backdrop-blur-md shadow-sm">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {!item.imageUrl && (
                        <div className="flex items-center gap-2.5 text-[11px] mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] font-semibold border border-black/[0.06]">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-semibold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-[#515154] mt-2.5 leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FAFAFC] border-t border-black/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedAnnouncement(item)}
                      className="text-xs font-semibold text-[#0071E3] hover:underline inline-flex items-center gap-1 py-1"
                    >
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-[#86868B]">Koperasi KNMP</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        </div>
      </main>

      {/* MODAL BACA ARTIKEL BLOG / PENGUMUMAN LENGKAP */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border border-black/[0.1] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {selectedAnnouncement.imageUrl && (
              <div className="h-48 sm:h-72 w-full overflow-hidden relative bg-gray-100">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                  aria-label="Tutup modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
              {!selectedAnnouncement.imageUrl && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  {selectedAnnouncement.category}
                </span>
                <span className="text-[#86868B]">{selectedAnnouncement.date}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                {selectedAnnouncement.title}
              </h2>

              <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F5F7] text-xs text-[#515154] font-medium leading-relaxed border-l-2 border-[#0071E3]">
                {selectedAnnouncement.summary}
              </div>

              <div className="text-xs sm:text-sm text-[#1D1D1F]/90 leading-relaxed whitespace-pre-line pt-1 sm:pt-2">
                {selectedAnnouncement.content || selectedAnnouncement.summary}
              </div>

              <div className="pt-4 sm:pt-6 border-t border-black/[0.08] flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-[#86868B]">
                  Dewan Koperasi Nelayan KNMP
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="bg-[#1D1D1F] hover:bg-black text-white text-xs px-4 py-2 rounded-full font-medium transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-black/[0.08] bg-white py-6 px-5 text-xs text-[#86868B]">
        <div className="max-w-[1120px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} Kampung Nelayan Merah Putih Oepuah, Kab. Timor Tengah Utara, NTT.
          </span>
          <span>Koperasi Nelayan Merah Putih Oepuah</span>
        </div>
      </footer>
    </div>
  );
}