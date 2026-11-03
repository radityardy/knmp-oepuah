'use client';

import React, { useEffect, useState } from 'react';
import { CmsData, ProductItem, StatItem } from '@/types/cms';
import {
  Anchor,
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  Fish,
  Image as ImageIcon,
  Lock,
  LogOut,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

// Pemformatan harga Rupiah otomatis tanpa perlu ketik manual "Rp" atau titik
function formatRupiahInput(value: string = ''): string {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
}

export default function AdminSubdomainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [password, setPassword] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState('');
  const [data, setData] = useState<CmsData | null>(null);
  const [activeSection, setActiveSection] = useState<
    'beranda' | 'pengurus' | 'mengenal' | 'produk' | 'pengumuman'
  >('beranda');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // State untuk Fitur Live Preview Modal
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<
    'beranda' | 'pengurus' | 'mengenal' | 'produk' | 'pengumuman'
  >('beranda');

  useEffect(() => {
    // 1. Cek sesi aktif dari cookie HttpOnly server-side
    fetch('/api/auth', { cache: 'no-store' })
      .then((r) => r.json())
      .then((res: { authenticated?: boolean }) => {
        if (res.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsCheckingSession(false));

    // 2. Ambil data CMS terbaru
    fetch('/api/cms', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: CmsData) => setData(d))
      .catch(() => {});
  }, []);

  // Client-side image compression supaya RAM server 512MB tetap enteng
  const compressImage = (file: File, maxWidth = 720): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = (await res.json()) as { authenticated?: boolean; error?: string };

      if (res.ok && payload.authenticated) {
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError(payload.error || 'Kata sandi otorisasi tidak valid.');
      }
    } catch {
      setAuthError('Gagal menghubungi server otorisasi.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' }).catch(() => {});
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveAll = async () => {
    if (!data) return;
    setSaveStatus('Menyimpan...');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (password) {
      headers['x-admin-key'] = password;
    }

    const res = await fetch('/api/cms', {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSaveStatus('Tersimpan');
      setTimeout(() => setSaveStatus(null), 2500);
    } else if (res.status === 401) {
      setSaveStatus('Sesi Berakhir');
      setIsAuthenticated(false);
    } else {
      setSaveStatus('Gagal menyimpan');
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs font-mono uppercase tracking-wider text-zinc-500">
        Memverifikasi Sesi Keamanan Admin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-5">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-xl p-7 sm:p-8 max-w-sm w-full border border-zinc-200/90 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-[#071A2E] text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
              HMAC-SHA256 Protected
            </span>
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-900">
              Panel Pengelola KNMP Oepuah
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Otorisasi Server-Side Portal Koperasi Nelayan Merah Putih
            </p>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-zinc-800 mb-1.5"
            >
              Kata Sandi Otorisasi
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi admin..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              required
            />
            {authError && (
              <p className="text-[11px] font-medium text-red-600 mt-1.5">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingAuth}
            className="w-full bg-[#071A2E] hover:bg-[#0D2847] disabled:opacity-60 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors duration-150 active:scale-[0.99]"
          >
            {isSubmittingAuth ? 'Memverifikasi...' : 'Masuk ke Panel CMS'}
          </button>

          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
            <a href="/" className="hover:text-zinc-900 transition-colors">
              ← Kembali ke Portal Publik
            </a>
            <span className="font-mono text-[10px]">Rate-Limited</span>
          </div>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs font-mono text-zinc-500">
        Memuat data CMS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-zinc-900 flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[#071A2E] text-white flex items-center justify-center shrink-0">
            <Anchor className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 truncate">
            <span className="sm:hidden">CMS KNMP</span>
            <span className="hidden sm:inline">CMS Panel — KNMP Oepuah</span>
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            Sesi Aktif • Terlindungi
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-[#FAF8F5]"
          >
            <span>Lihat Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Tombol Pratinjau Portal (Live Preview) */}
          <button
            type="button"
            onClick={() => {
              setPreviewTab(activeSection);
              setShowLivePreview(true);
            }}
            className="bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-300 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
            title="Pratinjau Portal Langsung"
          >
            <Eye className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span className="hidden sm:inline">Pratinjau Draft</span>
            <span className="sm:hidden">Preview</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            {saveStatus === 'Tersimpan' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Save className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{saveStatus || 'Simpan Semua'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs text-zinc-600 hover:text-zinc-900 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-colors inline-flex items-center"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">Keluar</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1180px] w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <div className="flex lg:flex-col overflow-x-auto gap-1.5 pb-1 lg:pb-0 no-scrollbar">
            {[
              { id: 'beranda', code: '01', label: 'Beranda, Metrik & Peta', short: 'Beranda' },
              { id: 'produk', code: '02', label: 'Katalog Produk Laut', short: 'Produk' },
              { id: 'mengenal', code: '03', label: 'Profil & Sekretariat', short: 'Profil' },
              { id: 'pengurus', code: '04', label: 'Dewan Pengurus', short: 'Pengurus' },
              { id: 'pengumuman', code: '05', label: 'Warta & Pengumuman', short: 'Warta' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`whitespace-nowrap text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center justify-between gap-2 ${
                  activeSection === tab.id
                    ? 'bg-[#071A2E] text-white font-semibold'
                    : 'bg-white text-zinc-700 border border-zinc-200/90 hover:bg-zinc-100'
                }`}
              >
                <div>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </div>
                <span className="font-mono text-[10px] opacity-70 tabular-nums">{tab.code}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:block mt-4 p-3.5 rounded-xl bg-white border border-zinc-200/90 text-[11px] text-zinc-600 leading-relaxed space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-900 font-semibold">
              Mode Single-Page (SPA)
            </div>
            <p>
              Seluruh seksi ditampilkan berurutan dalam satu halaman utuh di portal publik. Tekan{' '}
              <strong>Simpan Semua</strong> untuk memperbarui data secara instan.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 bg-white rounded-xl p-4 sm:p-6 lg:p-7 border border-zinc-200/90 shadow-sm">
          <div key={activeSection} className="animate-tab-switch space-y-6">
            {/* ================= 1. EDITOR BERANDA & METRIK ================= */}
            {activeSection === 'beranda' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-200 pb-3">
                  <h2 className="text-base font-semibold text-zinc-900">
                    Pengaturan Beranda & Hero
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Sesuaikan teks hero, banner gambar/vektor, serta tautan informasi ekosistem laut.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-800 mb-1">
                      Sub-Label Atas (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={data.beranda.eyebrow}
                      onChange={(e) =>
                        setData({ ...data, beranda: { ...data.beranda, eyebrow: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-800 mb-1">
                      Judul Utama Beranda
                    </label>
                    <textarea
                      rows={2}
                      value={data.beranda.title}
                      onChange={(e) =>
                        setData({ ...data, beranda: { ...data.beranda, title: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-800 mb-1">
                      Deskripsi Narasi Hero
                    </label>
                    <textarea
                      rows={3}
                      value={data.beranda.description}
                      onChange={(e) =>
                        setData({
                          ...data,
                          beranda: { ...data.beranda, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs leading-relaxed"
                    />
                  </div>

                  {/* Hyperlink Visual Card Header Settings */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                      <Fish className="w-4 h-4 text-sky-700" />
                      <span>Tautan & Header Kartu Ekosistem Laut (Bagian Kanan Hero)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          Judul Header Kartu
                        </label>
                        <input
                          type="text"
                          value={data.beranda.heroCardTitle ?? 'Ekosistem Perairan Laut Sawu — Oepuah'}
                          onChange={(e) =>
                            setData({
                              ...data,
                              beranda: { ...data.beranda, heroCardTitle: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          Koordinat / Teks Lokasi
                        </label>
                        <input
                          type="text"
                          value={data.beranda.heroCardCoords ?? "09°09'S 124°35'E"}
                          onChange={(e) =>
                            setData({
                              ...data,
                              beranda: { ...data.beranda, heroCardCoords: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono tabular-nums"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                          URL Hyperlink (Tautan Google Maps / Dokumen)
                        </label>
                        <input
                          type="text"
                          value={
                            data.beranda.heroCardLink ?? 'https://maps.google.com/?q=-9.15,124.58'
                          }
                          onChange={(e) =>
                            setData({
                              ...data,
                              beranda: { ...data.beranda, heroCardLink: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Image Settings */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] space-y-2 border border-zinc-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-900">
                        Ganti Gambar Hero dengan Foto Khusus
                      </label>
                      {data.beranda.heroImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setData({ ...data, beranda: { ...data.beranda, heroImageUrl: '' } })
                          }
                          className="text-[11px] text-sky-700 font-medium hover:underline"
                        >
                          Kembalikan ke Ilustrasi Vektor Ekosistem Laut
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file, 900);
                          setData({
                            ...data,
                            beranda: { ...data.beranda, heroImageUrl: compressed },
                          });
                        }
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>

                {/* SECTION METRIK OPERASIONAL */}
                <div className="pt-4 border-t border-zinc-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-1.5 text-zinc-900">
                        <BarChart3 className="w-4 h-4 text-sky-700" />
                        <span>Data Metrik Operasional Pesisir</span>
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Kelola kartu statistik capaian koperasi dengan format angka presisi.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newCard: StatItem = {
                          id: Date.now().toString(),
                          label: 'Metrik Baru',
                          value: '100',
                          unit: 'Unit',
                          detail: 'Keterangan operasional koperasi',
                          trendLabel: 'Aktif',
                        };
                        setData({
                          ...data,
                          beranda: {
                            ...data.beranda,
                            stats: [...data.beranda.stats, newCard],
                          },
                        });
                      }}
                      className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 self-start"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Kartu Metrik
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Judul Seksi Metrik</label>
                      <input
                        type="text"
                        value={data.beranda.statsTitle}
                        onChange={(e) =>
                          setData({
                            ...data,
                            beranda: { ...data.beranda, statsTitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Subjudul Seksi Metrik
                      </label>
                      <input
                        type="text"
                        value={data.beranda.statsSubtitle}
                        onChange={(e) =>
                          setData({
                            ...data,
                            beranda: { ...data.beranda, statsSubtitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {data.beranda.stats.map((stat, idx) => (
                      <div
                        key={stat.id}
                        className="p-4 rounded-xl border border-zinc-200 bg-[#FAF8F5] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-semibold text-zinc-900">
                            #0{idx + 1} — {stat.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-semibold tabular-nums text-sky-800">
                              {stat.value}
                              {stat.unit ? ` ${stat.unit}` : ''}
                            </span>
                            {data.beranda.stats.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = data.beranda.stats.filter((_, i) => i !== idx);
                                  setData({
                                    ...data,
                                    beranda: { ...data.beranda, stats: updated },
                                  });
                                }}
                                className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                              Label / Nama Metrik
                            </label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].label = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-medium"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                              Nilai Angka / Jumlah
                            </label>
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].value = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono font-semibold tabular-nums"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                              Satuan (Opsional)
                            </label>
                            <input
                              type="text"
                              value={stat.unit ?? ''}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].unit = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                              Keterangan Detail
                            </label>
                            <input
                              type="text"
                              value={stat.detail}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].detail = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                              Label Status / Catatan
                            </label>
                            <input
                              type="text"
                              value={stat.trendLabel ?? ''}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].trendLabel = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. EDITOR PENGURUS ================= */}
            {activeSection === 'pengurus' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      Daftar Pengurus & Kontak
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Nomor telepon / WhatsApp dan email bersifat opsional.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        pengurusSection: {
                          ...data.pengurusSection,
                          items: [
                            ...data.pengurusSection.items,
                            {
                              id: Date.now().toString(),
                              name: 'Nama Pengurus Baru',
                              role: 'Jabatan / Koordinator',
                              email: '',
                              phone: '',
                              photoUrl:
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
                            },
                          ],
                        },
                      })
                    }
                    className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Pengurus
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Judul Seksi Pengurus</label>
                    <input
                      type="text"
                      value={data.pengurusSection.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          pengurusSection: { ...data.pengurusSection, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Subjudul Seksi</label>
                    <input
                      type="text"
                      value={data.pengurusSection.subtitle}
                      onChange={(e) =>
                        setData({
                          ...data,
                          pengurusSection: { ...data.pengurusSection, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {data.pengurusSection.items.map((person, idx) => (
                    <div
                      key={person.id}
                      className="p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row gap-4 items-start bg-[#FAF8F5]"
                    >
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="w-20 h-20 rounded-lg object-cover bg-zinc-200 border border-zinc-300 shrink-0"
                      />

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => {
                              const updated = [...data.pengurusSection.items];
                              updated[idx].name = e.target.value;
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                            Jabatan Organisasi
                          </label>
                          <input
                            type="text"
                            value={person.role}
                            onChange={(e) => {
                              const updated = [...data.pengurusSection.items];
                              updated[idx].role = e.target.value;
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                            Nomor Telepon / WA (Opsional)
                          </label>
                          <input
                            type="text"
                            value={person.phone ?? ''}
                            onChange={(e) => {
                              const updated = [...data.pengurusSection.items];
                              updated[idx].phone = e.target.value;
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                            Alamat Email (Opsional)
                          </label>
                          <input
                            type="email"
                            value={person.email ?? ''}
                            onChange={(e) => {
                              const updated = [...data.pengurusSection.items];
                              updated[idx].email = e.target.value;
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                            URL Foto / Gambar
                          </label>
                          <input
                            type="text"
                            value={person.photoUrl}
                            onChange={(e) => {
                              const updated = [...data.pengurusSection.items];
                              updated[idx].photoUrl = e.target.value;
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-1">
                          <label className="text-xs text-sky-700 font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
                            <Upload className="w-3.5 h-3.5" /> Unggah Foto dari Perangkat
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const compressed = await compressImage(file, 500);
                                  const updated = [...data.pengurusSection.items];
                                  updated[idx].photoUrl = compressed;
                                  setData({
                                    ...data,
                                    pengurusSection: { ...data.pengurusSection, items: updated },
                                  });
                                }
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.pengurusSection.items.filter((_, i) => i !== idx);
                              setData({
                                ...data,
                                pengurusSection: { ...data.pengurusSection, items: updated },
                              });
                            }}
                            className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus Pengurus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 3. EDITOR MENGENAL KAMI ================= */}
            {activeSection === 'mengenal' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-200 pb-3">
                  <h2 className="text-base font-semibold text-zinc-900">
                    Profil Kawasan & Sekretariat
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Ubah narasi profil, visi misi, foto kawasan, serta alamat dan nomor kontak sekretariat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Judul Seksi Profil</label>
                    <input
                      type="text"
                      value={data.mengenalKami.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          mengenalKami: { ...data.mengenalKami, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Subjudul Profil</label>
                    <input
                      type="text"
                      value={data.mengenalKami.subtitle}
                      onChange={(e) =>
                        setData({
                          ...data,
                          mengenalKami: { ...data.mengenalKami, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Narasi Kawasan Pesisir & Koperasi
                  </label>
                  <textarea
                    rows={5}
                    value={data.mengenalKami.narrative}
                    onChange={(e) =>
                      setData({
                        ...data,
                        mengenalKami: { ...data.mengenalKami, narrative: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Visi Utama</label>
                    <textarea
                      rows={4}
                      value={data.mengenalKami.vision}
                      onChange={(e) =>
                        setData({
                          ...data,
                          mengenalKami: { ...data.mengenalKami, vision: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium">Daftar Misi Strategis</label>
                      <button
                        type="button"
                        onClick={() =>
                          setData({
                            ...data,
                            mengenalKami: {
                              ...data.mengenalKami,
                              missions: [...data.mengenalKami.missions, 'Misi baru KNMP Oepuah'],
                            },
                          })
                        }
                        className="text-[11px] text-sky-700 font-medium hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Tambah Misi
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {data.mengenalKami.missions.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={m}
                            onChange={(e) => {
                              const updated = [...data.mengenalKami.missions];
                              updated[mIdx] = e.target.value;
                              setData({
                                ...data,
                                mengenalKami: { ...data.mengenalKami, missions: updated },
                              });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.mengenalKami.missions.filter(
                                (_, i) => i !== mIdx
                              );
                              setData({
                                ...data,
                                mengenalKami: { ...data.mengenalKami, missions: updated },
                              });
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Foto Kawasan & Info Kontak Sekretariat */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-zinc-200 space-y-4">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-700" />
                    <span>Sekretariat & Informasi Kontak Kantor</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 aspect-[4/3] rounded-lg overflow-hidden border border-zinc-300 bg-zinc-200">
                      <img
                        src={data.mengenalKami.imageUrl}
                        alt="Sekretariat"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="sm:col-span-8 space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                          URL Foto Sekretariat / Kawasan Pesisir
                        </label>
                        <input
                          type="text"
                          value={data.mengenalKami.imageUrl}
                          onChange={(e) =>
                            setData({
                              ...data,
                              mengenalKami: { ...data.mengenalKami, imageUrl: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                        />
                      </div>
                      <label className="text-xs text-sky-700 font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
                        <Upload className="w-3.5 h-3.5" /> Unggah Foto Kawasan dari Perangkat
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file, 800);
                              setData({
                                ...data,
                                mengenalKami: { ...data.mengenalKami, imageUrl: compressed },
                              });
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Alamat Lengkap Sekretariat Koperasi
                      </label>
                      <input
                        type="text"
                        value={data.mengenalKami.address}
                        onChange={(e) =>
                          setData({
                            ...data,
                            mengenalKami: { ...data.mengenalKami, address: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Nomor Telepon / WhatsApp Resmi
                      </label>
                      <input
                        type="text"
                        value={data.mengenalKami.phone}
                        onChange={(e) =>
                          setData({
                            ...data,
                            mengenalKami: { ...data.mengenalKami, phone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Alamat Email Resmi
                      </label>
                      <input
                        type="email"
                        value={data.mengenalKami.email}
                        onChange={(e) =>
                          setData({
                            ...data,
                            mengenalKami: { ...data.mengenalKami, email: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. EDITOR PRODUK (HARGA OTOMATIS RP) ================= */}
            {activeSection === 'produk' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      Katalog Produk Hasil Laut
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Kelola komoditas tangkapan. Harga otomatis diformat dengan awalan{' '}
                      <strong>Rp</strong> dan pemisah ribuan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        produkSection: {
                          ...data.produkSection,
                          items: [
                            ...data.produkSection.items,
                            {
                              id: Date.now().toString(),
                              name: 'Komoditas Baru',
                              latinName: 'Spesies Laut',
                              category: 'Pelagis',
                              pricePerKg: 'Rp 50.000',
                              availability: 'Tersedia',
                              description: 'Deskripsi tangkapan nelayan Oepuah.',
                              imageUrl:
                                'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
                            },
                          ],
                        },
                      })
                    }
                    className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Produk
                  </button>
                </div>

                {data.produkSection.items.map((prd, idx) => (
                  <div
                    key={prd.id}
                    className="p-4 rounded-xl border border-zinc-200 space-y-2.5 bg-[#FAF8F5]"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={prd.name}
                        onChange={(e) => {
                          const updated = [...data.produkSection.items];
                          updated[idx].name = e.target.value;
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        placeholder="Nama Ikan"
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold"
                      />
                      <input
                        type="text"
                        value={prd.latinName}
                        onChange={(e) => {
                          const updated = [...data.produkSection.items];
                          updated[idx].latinName = e.target.value;
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        placeholder="Nama Latin"
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs italic"
                      />
                      <input
                        type="text"
                        value={prd.category}
                        onChange={(e) => {
                          const updated = [...data.produkSection.items];
                          updated[idx].category = e.target.value;
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        placeholder="Kategori"
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                      />

                      <div className="flex rounded-lg border border-zinc-300 bg-white overflow-hidden focus-within:border-zinc-900">
                        <span className="inline-flex items-center px-2.5 bg-zinc-100 text-[11px] font-mono font-semibold text-zinc-700 border-r border-zinc-200 select-none">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={formatRupiahInput(prd.pricePerKg)}
                          onChange={(e) => {
                            const formatted = formatRupiahInput(e.target.value);
                            const updated = [...data.produkSection.items];
                            updated[idx].pricePerKg = formatted ? `Rp ${formatted}` : '';
                            setData({
                              ...data,
                              produkSection: { ...data.produkSection, items: updated },
                            });
                          }}
                          placeholder="100.000"
                          className="w-full px-2.5 py-1.5 bg-transparent text-xs font-mono font-semibold tabular-nums focus:outline-none"
                        />
                        <span className="inline-flex items-center px-2 text-[10px] font-mono text-zinc-500 bg-zinc-50 border-l border-zinc-200 select-none">
                          /kg
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <select
                        value={prd.availability}
                        onChange={(e) => {
                          const updated = [...data.produkSection.items];
                          updated[idx].availability = e.target.value as ProductItem['availability'];
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                      >
                        <option value="Tersedia">Tersedia</option>
                        <option value="Terbatas">Terbatas</option>
                        <option value="Musiman">Musiman</option>
                      </select>

                      <input
                        type="text"
                        value={prd.imageUrl}
                        onChange={(e) => {
                          const updated = [...data.produkSection.items];
                          updated[idx].imageUrl = e.target.value;
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        placeholder="URL Foto Ikan"
                        className="sm:col-span-3 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={prd.description}
                      onChange={(e) => {
                        const updated = [...data.produkSection.items];
                        updated[idx].description = e.target.value;
                        setData({
                          ...data,
                          produkSection: { ...data.produkSection, items: updated },
                        });
                      }}
                      placeholder="Deskripsi komoditas..."
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs text-sky-700 font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
                        <Upload className="w-3.5 h-3.5" /> Ganti Foto Ikan dari Perangkat
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const compressed = await compressImage(file, 650);
                              const updated = [...data.produkSection.items];
                              updated[idx].imageUrl = compressed;
                              setData({
                                ...data,
                                produkSection: { ...data.produkSection, items: updated },
                              });
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data.produkSection.items.filter((_, i) => i !== idx);
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus Produk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= 5. EDITOR PENGUMUMAN / BLOG ================= */}
            {activeSection === 'pengumuman' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900">
                      Pengumuman & Warta Resmi
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Buat pengumuman resmi atau artikel berita komunitas dengan banner foto.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        pengumumanSection: {
                          ...data.pengumumanSection,
                          items: [
                            {
                              id: Date.now().toString(),
                              title: 'Judul Warta / Pengumuman Baru',
                              date: 'November 2026',
                              category: 'Operasional',
                              summary: 'Ringkasan singkat yang tampil di kartu halaman utama.',
                              content:
                                'Tulis isi maklumat lengkap atau artikel berita di sini. Mendukung multi-paragraf dan rincian informasi penting.',
                              imageUrl:
                                'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
                            },
                            ...data.pengumumanSection.items,
                          ],
                        },
                      })
                    }
                    className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Warta Baru
                  </button>
                </div>

                <div className="space-y-5 pt-2">
                  {data.pengumumanSection.items.map((ann, idx) => (
                    <div
                      key={ann.id}
                      className="p-4 sm:p-5 rounded-xl border border-zinc-200 bg-[#FAF8F5] space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden bg-zinc-200 border border-zinc-300 shrink-0 relative">
                          {ann.imageUrl ? (
                            <img
                              src={ann.imageUrl}
                              alt={ann.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-[10px] font-mono">
                              <ImageIcon className="w-5 h-5 mb-1 opacity-60" />
                              <span>Tanpa Banner</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2.5 w-full">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={ann.title}
                              onChange={(e) => {
                                const updated = [...data.pengumumanSection.items];
                                updated[idx].title = e.target.value;
                                setData({
                                  ...data,
                                  pengumumanSection: { ...data.pengumumanSection, items: updated },
                                });
                              }}
                              placeholder="Judul Pengumuman"
                              className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={ann.category}
                              onChange={(e) => {
                                const updated = [...data.pengumumanSection.items];
                                updated[idx].category = e.target.value;
                                setData({
                                  ...data,
                                  pengumumanSection: { ...data.pengumumanSection, items: updated },
                                });
                              }}
                              placeholder="Kategori"
                              className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={ann.date}
                              onChange={(e) => {
                                const updated = [...data.pengumumanSection.items];
                                updated[idx].date = e.target.value;
                                setData({
                                  ...data,
                                  pengumumanSection: { ...data.pengumumanSection, items: updated },
                                });
                              }}
                              placeholder="Tanggal Rilis"
                              className="px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono tabular-nums"
                            />
                            <input
                              type="text"
                              value={ann.imageUrl ?? ''}
                              onChange={(e) => {
                                const updated = [...data.pengumumanSection.items];
                                updated[idx].imageUrl = e.target.value;
                                setData({
                                  ...data,
                                  pengumumanSection: { ...data.pengumumanSection, items: updated },
                                });
                              }}
                              placeholder="URL Banner Foto (opsional)"
                              className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                          Ringkasan Singkat
                        </label>
                        <textarea
                          rows={2}
                          value={ann.summary}
                          onChange={(e) => {
                            const updated = [...data.pengumumanSection.items];
                            updated[idx].summary = e.target.value;
                            setData({
                              ...data,
                              pengumumanSection: { ...data.pengumumanSection, items: updated },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                          Isi Lengkap Artikel / Pengumuman
                        </label>
                        <textarea
                          rows={4}
                          value={ann.content ?? ''}
                          onChange={(e) => {
                            const updated = [...data.pengumumanSection.items];
                            updated[idx].content = e.target.value;
                            setData({
                              ...data,
                              pengumumanSection: { ...data.pengumumanSection, items: updated },
                            });
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 bg-white text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                        <label className="text-xs text-sky-700 font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
                          <Upload className="w-3.5 h-3.5" /> Unggah Banner Foto dari Perangkat
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const compressed = await compressImage(file, 850);
                                const updated = [...data.pengumumanSection.items];
                                updated[idx].imageUrl = compressed;
                                setData({
                                  ...data,
                                  pengumumanSection: { ...data.pengumumanSection, items: updated },
                                });
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.pengumumanSection.items.filter(
                              (_, i) => i !== idx
                            );
                            setData({
                              ...data,
                              pengumumanSection: { ...data.pengumumanSection, items: updated },
                            });
                          }}
                          className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Warta
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ================= MODAL PRATINJAU PORTAL (LIVE PREVIEW) ================= */}
      {showLivePreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex flex-col">
          <div className="h-14 bg-white border-b border-zinc-200 px-3 sm:px-6 flex items-center justify-between shrink-0 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                Draft Live Preview
              </span>
              <div className="hidden sm:flex items-center gap-1">
                {(
                  [
                    { key: 'beranda', label: '01 Beranda' },
                    { key: 'produk', label: '02 Produk' },
                    { key: 'mengenal', label: '03 Profil' },
                    { key: 'pengurus', label: '04 Pengurus' },
                    { key: 'pengumuman', label: '05 Warta' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setPreviewTab(t.key)}
                    className={`text-xs px-3 py-1 rounded-md transition-colors ${
                      previewTab === t.key
                        ? 'bg-[#071A2E] text-white font-semibold'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveAll}
                className="bg-[#071A2E] hover:bg-[#0D2847] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLivePreview(false)}
                className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#FAF8F5] p-4 sm:p-6">
            <div className="max-w-[1060px] mx-auto bg-white rounded-xl border border-zinc-200 p-5 sm:p-8 space-y-6">
              {previewTab === 'beranda' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-[#071A2E] text-white space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-300">
                      {data.beranda.eyebrow}
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight">{data.beranda.title}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {data.beranda.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {data.beranda.stats.map((s) => (
                      <div key={s.id} className="p-4 rounded-lg border border-zinc-200 bg-[#FAF8F5]">
                        <span className="text-xs text-zinc-500">{s.label}</span>
                        <div className="text-xl font-mono font-semibold tabular-nums mt-1">
                          {s.value} {s.unit}
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-1 block">{s.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewTab === 'produk' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {data.produkSection.items.map((p) => (
                    <div key={p.id} className="rounded-lg border border-zinc-200 overflow-hidden">
                      <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover" />
                      <div className="p-4 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500">
                          {p.category}
                        </span>
                        <h3 className="text-sm font-semibold">{p.name}</h3>
                        <p className="text-sm font-mono font-semibold tabular-nums text-zinc-900">
                          {p.pricePerKg} / kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {previewTab === 'mengenal' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">{data.mengenalKami.title}</h2>
                  <p className="text-xs text-zinc-700 whitespace-pre-line leading-relaxed">
                    {data.mengenalKami.narrative}
                  </p>
                </div>
              )}

              {previewTab === 'pengurus' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {data.pengurusSection.items.map((person) => (
                    <div key={person.id} className="p-4 rounded-lg border border-zinc-200 space-y-2">
                      <img
                        src={person.photoUrl}
                        alt={person.name}
                        className="w-full h-36 object-cover rounded"
                      />
                      <span className="text-[10px] font-mono uppercase text-sky-800">
                        {person.role}
                      </span>
                      <h3 className="text-sm font-semibold">{person.name}</h3>
                    </div>
                  ))}
                </div>
              )}

              {previewTab === 'pengumuman' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.pengumumanSection.items.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-lg border border-zinc-200 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-zinc-500">
                        {ann.category} • {ann.date}
                      </span>
                      <h3 className="text-sm font-semibold">{ann.title}</h3>
                      <p className="text-xs text-zinc-600">{ann.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
