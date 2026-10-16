'use client';

import React, { useEffect, useState } from 'react';
import { CmsData, ProductItem, StatItem } from '@/types/cms';
import {
  BarChart3,
  Check,
  ExternalLink,
  Eye,
  Fish,
  Image as ImageIcon,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Waves,
  X,
} from 'lucide-react';

// Helper pemformatan harga Rupiah otomatis tanpa perlu ketik manual "Rp" atau titik
function formatRupiahInput(value: string = ''): string {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return new Intl.NumberFormat('id-ID').format(Number(digitsOnly));
}

export default function AdminSubdomainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
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
    fetch('/api/cms')
      .then((r) => r.json())
      .then((d: CmsData) => setData(d));
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'MerahPutih2026') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Kata sandi otorisasi tidak valid.');
    }
  };

  const handleSaveAll = async () => {
    if (!data) return;
    setSaveStatus('Menyimpan...');
    const res = await fetch('/api/cms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': password || 'MerahPutih2026',
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setSaveStatus('Tersimpan');
      setTimeout(() => setSaveStatus(null), 2500);
    } else {
      setSaveStatus('Gagal menyimpan');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-5">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl p-8 max-w-sm w-full border border-black/[0.08] shadow-sm space-y-5"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-white flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-center">
            <h1 className="text-base font-semibold text-[#1D1D1F]">Panel CMS KNMP Oepuah</h1>
            <p className="text-xs text-[#86868B] mt-1">Otorisasi Subdomain admin.knmp-oepuah.id</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.1] text-xs focus:outline-none focus:border-[#0071E3]"
              required
            />
            {authError && <p className="text-[11px] text-red-600 mt-1.5">{authError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-[#0071E3] hover:bg-[#0077ED] text-white py-2 rounded-xl text-xs font-semibold transition"
          >
            Masuk ke Panel
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center text-xs text-[#86868B]">
        Memuat data CMS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/[0.08] px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate">
            <span className="sm:hidden">CMS KNMP</span>
            <span className="hidden sm:inline">CMS Panel — KNMP Oepuah</span>
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
            admin.knmp-oepuah.id
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tombol Pratinjau Portal (Live Preview) */}
          <button
            type="button"
            onClick={() => {
              setPreviewTab(activeSection);
              setShowLivePreview(true);
            }}
            className="bg-white hover:bg-gray-50 text-[#1D1D1F] border border-black/[0.12] text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-1 sm:gap-1.5 transition shadow-sm"
            title="Pratinjau Portal Langsung"
          >
            <Eye className="w-3.5 h-3.5 text-[#0071E3] shrink-0" />
            <span className="hidden sm:inline">Pratinjau Portal</span>
            <span className="sm:hidden">Preview</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-flex items-center gap-1 sm:gap-1.5 transition shadow-sm"
          >
            {saveStatus === 'Tersimpan' ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Save className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{saveStatus || 'Simpan'}</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs text-[#86868B] hover:text-[#1D1D1F] p-1.5 sm:px-3 sm:py-1.5 rounded-full hover:bg-black/[0.05] transition"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1">Keluar</span>
          </button>
        </div>
      </header>

      <div className="max-w-[1180px] w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        {/* Navigation Sidebar (Horizontal Scroll Pills on Mobile, Sidebar on Desktop) */}
        <aside className="lg:col-span-3">
          <div className="flex lg:flex-col overflow-x-auto gap-1.5 sm:gap-2 pb-1 lg:pb-0 no-scrollbar">
            {[
              { id: 'beranda', label: '1. Beranda, Metrik & Peta', short: '1. Beranda' },
              { id: 'pengurus', label: '2. Pengurus & Kontak', short: '2. Pengurus' },
              { id: 'mengenal', label: '3. Mengenal Kami & Kantor', short: '3. Mengenal' },
              { id: 'produk', label: '4. Produk Hasil Laut', short: '4. Produk' },
              { id: 'pengumuman', label: '5. Pengumuman / Blog', short: '5. Warta Blog' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`whitespace-nowrap text-left px-3.5 py-2 lg:py-2.5 rounded-xl text-xs font-medium transition shrink-0 ${
                  activeSection === tab.id
                    ? 'bg-[#1D1D1F] text-white font-semibold shadow-sm'
                    : 'bg-white lg:bg-transparent text-[#515154] border border-black/[0.08] lg:border-transparent hover:bg-black/[0.04]'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </button>
            ))}
          </div>

          <div className="hidden lg:block pt-4 px-3 text-[11px] text-[#86868B] leading-relaxed">
            Semua perubahan tersimpan permanen di server dan langsung tampil di portal publik setelah Anda menekan tombol <strong>Simpan Semua</strong>.
          </div>
        </aside>

        {/* Content Area dengan Transisi Halus (Smooth Tab Animation) */}
        <section className="lg:col-span-9 bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-black/[0.08] shadow-sm">
          <div key={activeSection} className="animate-tab-switch space-y-6 sm:space-y-8">
            {/* ================= 1. EDITOR BERANDA & METRIK ================= */}
            {activeSection === 'beranda' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-[#1D1D1F]">Pengaturan Beranda & Hero</h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Sesuaikan teks hero, banner gambar/vektor, serta tautan informasi ekosistem laut.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Sub-Label Atas (Eyebrow)</label>
                    <input
                      type="text"
                      value={data.beranda.eyebrow}
                      onChange={(e) =>
                        setData({ ...data, beranda: { ...data.beranda, eyebrow: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Judul Utama Beranda</label>
                    <textarea
                      rows={2}
                      value={data.beranda.title}
                      onChange={(e) =>
                        setData({ ...data, beranda: { ...data.beranda, title: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Deskripsi Narasi Hero</label>
                    <textarea
                      rows={3}
                      value={data.beranda.description}
                      onChange={(e) =>
                        setData({
                          ...data,
                          beranda: { ...data.beranda, description: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs leading-relaxed"
                    />
                  </div>

                  {/* Hyperlink Visual Card Header Settings */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                      <Fish className="w-4 h-4 text-[#0071E3]" />
                      <span>Tautan & Header Kartu Ekosistem Laut (Bagian Kanan Hero)</span>
                    </div>
                    <p className="text-[11px] text-blue-800/80">
                      Bagian ini akan menjadi hyperlink aktif di halaman depan. Pengunjung dapat mengkliknya untuk membuka Google Maps atau halaman referensi.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
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
                          placeholder="Contoh: Ekosistem Perairan Laut Sawu — Oepuah"
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
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
                          placeholder="09°09'S 124°35'E"
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-700 mb-1">
                          URL Hyperlink (Tautan Google Maps / Dokumen)
                        </label>
                        <input
                          type="text"
                          value={data.beranda.heroCardLink ?? 'https://maps.google.com/?q=-9.15,124.58'}
                          onChange={(e) =>
                            setData({
                              ...data,
                              beranda: { ...data.beranda, heroCardLink: e.target.value },
                            })
                          }
                          placeholder="https://maps.google.com/?q=-9.15,124.58"
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Image Settings */}
                  <div className="p-4 rounded-xl bg-[#F5F5F7] space-y-2 border border-black/[0.05]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold">Ganti Gambar Hero dengan Foto Khusus</label>
                      {data.beranda.heroImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setData({ ...data, beranda: { ...data.beranda, heroImageUrl: '' } })
                          }
                          className="text-[11px] text-[#0071E3] hover:underline"
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
                    <p className="text-[11px] text-[#86868B]">
                      Jika dikosongkan, halaman akan otomatis menampilkan ilustrasi vektor ikan laut interaktif yang estetik dan super ringan.
                    </p>
                  </div>
                </div>

                {/* SECTION METRIK OPERASIONAL (FLEKSIBEL TANPA GRAFIK) */}
                <div className="pt-4 border-t border-black/[0.08] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-[#0071E3]" />
                        <span>Data Metrik Operasional Pesisir</span>
                      </h3>
                      <p className="text-xs text-[#86868B]">
                        Kelola kartu statistik capaian koperasi. Anda bebas mengubah nilai, satuan, serta menambah atau menghapus kartu metrik.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newCard: StatItem = {
                          id: Date.now().toString(),
                          label: 'Kas KNMP Oepuah',
                          value: 'Rp 148.500.000',
                          unit: '',
                          detail: 'Likuiditas simpan pinjam & modal es nelayan',
                          trendLabel: 'Kas Lancar & Transparan',
                        };
                        setData({
                          ...data,
                          beranda: {
                            ...data.beranda,
                            stats: [...data.beranda.stats, newCard],
                          },
                        });
                      }}
                      className="bg-[#1D1D1F] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 self-start shadow-sm"
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
                          setData({ ...data, beranda: { ...data.beranda, statsTitle: e.target.value } })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Subjudul Seksi Metrik</label>
                      <input
                        type="text"
                        value={data.beranda.statsSubtitle}
                        onChange={(e) =>
                          setData({
                            ...data,
                            beranda: { ...data.beranda, statsSubtitle: e.target.value },
                          })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {data.beranda.stats.map((stat, idx) => (
                      <div
                        key={stat.id}
                        className="p-4 rounded-xl border border-black/[0.08] bg-[#FAFAFC] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#1D1D1F]">
                            Kartu Metrik #{idx + 1}: {stat.label}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-[#0071E3]">
                              {stat.value}{stat.unit ? ` ${stat.unit}` : ''}
                            </span>
                            {data.beranda.stats.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = data.beranda.stats.filter((_, i) => i !== idx);
                                  setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                                }}
                                className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                                title="Hapus Kartu Metrik"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                              placeholder="Contoh: Kas KNMP Oepuah"
                              className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs font-medium"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                              placeholder="Contoh: 142 atau Rp 148.500.000"
                              className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs font-semibold"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] font-medium text-[#515154] mb-1">
                              Satuan (Boleh Kosong)
                            </label>
                            <input
                              type="text"
                              value={stat.unit ?? ''}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].unit = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              placeholder="Unit / Ton / KK / °C"
                              className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-[#515154] mb-1">
                              Keterangan Detail Bawah
                            </label>
                            <input
                              type="text"
                              value={stat.detail}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].detail = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              placeholder="Keterangan singkat capaian..."
                              className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#515154] mb-1">
                              Label Status / Catatan (Opsional)
                            </label>
                            <input
                              type="text"
                              value={stat.trendLabel ?? ''}
                              onChange={(e) => {
                                const updated = [...data.beranda.stats];
                                updated[idx].trendLabel = e.target.value;
                                setData({ ...data, beranda: { ...data.beranda, stats: updated } });
                              }}
                              placeholder="Contoh: +12 unit thn ini / Kas Lancar"
                              className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h2 className="text-base font-semibold">Daftar Pengurus & Kontak</h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Nomor telepon / WhatsApp dan email bersifat opsional (bebas diisi atau dikosongkan).
                    </p>
                  </div>
                  <button
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
                    className="bg-[#1D1D1F] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 self-start"
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
                      className="w-full px-3 py-1.5 rounded-lg border text-xs"
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
                      className="w-full px-3 py-1.5 rounded-lg border text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {data.pengurusSection.items.map((person, idx) => (
                    <div
                      key={person.id}
                      className="p-4 rounded-xl border border-black/[0.08] flex flex-col sm:flex-row gap-4 items-start bg-[#FAFAFC]"
                    >
                      <div className="relative group shrink-0">
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                        />
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                        <div>
                          <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                            placeholder="Nama Pengurus"
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                            placeholder="Jabatan Pengurus"
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#515154] mb-1">
                            Nomor Telepon / WA (Bebas / Opsional)
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
                            placeholder="Contoh: +62 812-3456-7890 (Boleh kosong)"
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                            placeholder="email@knmp-oepuah.id (Boleh kosong)"
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                            placeholder="https://..."
                            className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-1">
                          <label className="text-xs text-[#0071E3] font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
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
                <div>
                  <h2 className="text-base font-semibold">Edit Lengkap &ldquo;Mengenal Kami&rdquo;</h2>
                  <p className="text-xs text-[#86868B] mt-0.5">
                    Ubah narasi profil, visi misi, foto kawasan, serta alamat dan nomor kontak sekretariat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Judul Halaman Profil</label>
                    <input
                      type="text"
                      value={data.mengenalKami.title}
                      onChange={(e) =>
                        setData({
                          ...data,
                          mengenalKami: { ...data.mengenalKami, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Subjudul Halaman</label>
                    <input
                      type="text"
                      value={data.mengenalKami.subtitle}
                      onChange={(e) =>
                        setData({
                          ...data,
                          mengenalKami: { ...data.mengenalKami, subtitle: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">
                    Narasi Kawasan Pesisir & Koperasi (Mendukung Multi-paragraf)
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
                    className="w-full px-3 py-2 rounded-lg border text-xs leading-relaxed"
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
                      className="w-full px-3 py-2 rounded-lg border text-xs"
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
                        className="text-[11px] text-[#0071E3] hover:underline inline-flex items-center gap-1"
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
                            className="flex-1 px-3 py-1.5 rounded-lg border text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = data.mengenalKami.missions.filter((_, i) => i !== mIdx);
                              setData({
                                ...data,
                                mengenalKami: { ...data.mengenalKami, missions: updated },
                              });
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Foto Kawasan & Info Kontak Sekretariat */}
                <div className="p-4 rounded-xl bg-[#FAFAFC] border border-black/[0.08] space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0071E3] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Sekretariat & Informasi Kontak Kantor</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 aspect-[4/3] rounded-xl overflow-hidden border border-black/[0.08] bg-gray-100">
                      <img
                        src={data.mengenalKami.imageUrl}
                        alt="Sekretariat"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="sm:col-span-8 space-y-2">
                      <div>
                        <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                        />
                      </div>
                      <label className="text-xs text-[#0071E3] font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
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
                      <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                        className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                        className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#515154] mb-1">
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
                        className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. EDITOR PRODUK (HARGA OTOMATIS RP) ================= */}
            {activeSection === 'produk' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-base font-semibold">Katalog Produk Hasil Laut</h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Kelola komoditas tangkapan. Harga otomatis diformat dengan awalan <strong>Rp</strong> dan pemisah ribuan.
                    </p>
                  </div>
                  <button
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
                              category: 'Ikan Segar',
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
                    className="bg-[#1D1D1F] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Produk
                  </button>
                </div>

                {data.produkSection.items.map((prd, idx) => (
                  <div
                    key={prd.id}
                    className="p-4 rounded-xl border border-black/[0.08] space-y-2.5 bg-[#FAFAFC]"
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
                        className="px-3 py-1.5 rounded-lg border bg-white text-xs font-semibold"
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
                        className="px-3 py-1.5 rounded-lg border bg-white text-xs italic"
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
                        className="px-3 py-1.5 rounded-lg border bg-white text-xs"
                      />

                      {/* INPUT HARGA OTOMATIS: User tinggal ketik angka, otomatis ada Rp dan titik ribuan */}
                      <div className="flex rounded-lg border border-black/[0.12] bg-white overflow-hidden focus-within:border-[#0071E3] focus-within:ring-1 focus-within:ring-[#0071E3]">
                        <span className="inline-flex items-center px-2.5 bg-gray-100 text-[11px] font-semibold text-gray-600 border-r border-black/[0.08] select-none">
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
                          className="w-full px-2.5 py-1.5 bg-transparent text-xs font-semibold focus:outline-none"
                        />
                        <span className="inline-flex items-center px-2 text-[10px] text-gray-400 bg-gray-50 border-l border-black/[0.06] select-none">
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
                        className="px-3 py-1.5 rounded-lg border bg-white text-xs"
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
                        className="sm:col-span-3 px-3 py-1.5 rounded-lg border bg-white text-xs"
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
                      className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-xs text-[#0071E3] font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
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
                        onClick={() => {
                          const updated = data.produkSection.items.filter((_, i) => i !== idx);
                          setData({
                            ...data,
                            produkSection: { ...data.produkSection, items: updated },
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Hapus Produk
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ================= 5. EDITOR PENGUMUMAN / BLOG ================= */}
            {activeSection === 'pengumuman' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h2 className="text-base font-semibold">Pengumuman & Warta Blog</h2>
                    <p className="text-xs text-[#86868B] mt-0.5">
                      Buat pengumuman resmi atau artikel berita komunitas dengan banner foto seperti blog.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setData({
                        ...data,
                        pengumumanSection: {
                          ...data.pengumumanSection,
                          items: [
                            {
                              id: Date.now().toString(),
                              title: 'Judul Warta / Pengumuman Baru',
                              date: 'Oktober 2026',
                              category: 'Operasional',
                              summary: 'Ringkasan singkat yang menarik minat pembaca.',
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
                    className="bg-[#1D1D1F] hover:bg-black text-white text-xs px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 self-start"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Warta Baru
                  </button>
                </div>

                <div className="space-y-6 pt-2">
                  {data.pengumumanSection.items.map((ann, idx) => (
                    <div
                      key={ann.id}
                      className="p-5 rounded-2xl border border-black/[0.08] bg-[#FAFAFC] space-y-3.5"
                    >
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Thumbnail Preview */}
                        <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-gray-200 border border-black/[0.08] shrink-0 relative">
                          {ann.imageUrl ? (
                            <img
                              src={ann.imageUrl}
                              alt={ann.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-[10px]">
                              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                              <span>Tanpa Banner Foto</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Metadata Inputs */}
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
                              className="sm:col-span-2 px-3 py-1.5 rounded-lg border bg-white text-xs font-semibold"
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
                              placeholder="Kategori (mis: Operasional)"
                              className="px-3 py-1.5 rounded-lg border bg-white text-xs"
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
                              className="px-3 py-1.5 rounded-lg border bg-white text-xs"
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
                              className="sm:col-span-2 px-3 py-1.5 rounded-lg border bg-white text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#515154] mb-1">
                          Ringkasan Singkat (Tampil di kartu depan)
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
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#515154] mb-1">
                          Isi Lengkap Artikel / Pengumuman Blog (Tampil saat diklik &ldquo;Baca Selengkapnya&rdquo;)
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
                          placeholder="Tulis artikel berita, notulen rapat koperasi, maklumat cuaca maritim, atau instruksi lengkap..."
                          className="w-full px-3 py-1.5 rounded-lg border bg-white text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-black/[0.05]">
                        <label className="text-xs text-[#0071E3] font-medium cursor-pointer inline-flex items-center gap-1 hover:underline">
                          <Upload className="w-3.5 h-3.5" /> Unggah Banner Foto Artikel dari Perangkat
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
                          onClick={() => {
                            const updated = data.pengumumanSection.items.filter((_, i) => i !== idx);
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex flex-col">
          {/* Top Control Bar */}
          <div className="h-14 bg-white border-b border-black/[0.08] px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-sm gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                <span className="sm:hidden">Pratinjau</span>
                <span className="hidden sm:inline">Mode Pratinjau (Draft Live)</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 md:gap-2">
                {(
                  [
                    { key: 'beranda', label: 'Beranda' },
                    { key: 'pengurus', label: 'Pengurus' },
                    { key: 'mengenal', label: 'Mengenal Kami' },
                    { key: 'produk', label: 'Produk' },
                    { key: 'pengumuman', label: 'Pengumuman' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setPreviewTab(t.key)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      previewTab === t.key
                        ? 'bg-[#1D1D1F] text-white font-medium shadow-sm'
                        : 'text-[#86868B] hover:text-[#1D1D1F]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open('/', '_blank')}
                className="hidden md:inline-flex items-center gap-1 text-xs text-[#0071E3] hover:underline px-2 py-1"
              >
                <span>Buka Tab Baru</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={handleSaveAll}
                className="bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Simpan Perubahan</span>
                <span className="xs:hidden">Simpan</span>
              </button>
              <button
                onClick={() => setShowLivePreview(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                title="Tutup Pratinjau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Preview Sub-bar: Navigasi Antar Tab Khusus HP */}
          <div className="flex sm:hidden overflow-x-auto px-3 py-2 gap-1.5 bg-[#F5F5F7] border-b border-black/[0.08] no-scrollbar shrink-0">
            {(
              [
                { key: 'beranda', label: 'Beranda' },
                { key: 'pengurus', label: 'Pengurus' },
                { key: 'mengenal', label: 'Mengenal' },
                { key: 'produk', label: 'Produk' },
                { key: 'pengumuman', label: 'Warta' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setPreviewTab(t.key)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition shrink-0 ${
                  previewTab === t.key
                    ? 'bg-[#1D1D1F] text-white font-medium shadow-sm'
                    : 'bg-white text-[#515154] border border-black/[0.08]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Body Preview: Render persis portal publik menggunakan state draft saat ini */}
          <div className="flex-1 overflow-y-auto bg-[#F5F5F7]">
            <div key={previewTab} className="animate-tab-switch max-w-[1120px] mx-auto pb-16">
              {/* TAB BERANDA PREVIEW */}
              {previewTab === 'beranda' && (
                <div>
                  <section className="bg-[#071D36] text-white pt-8 sm:pt-12 pb-14 sm:pb-20 px-4 sm:px-5 rounded-b-2xl sm:rounded-b-3xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
                      <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-[11px] font-medium tracking-wider uppercase text-blue-200">
                          <Waves className="w-3.5 h-3.5 text-sky-400" />
                          <span>{data.beranda.eyebrow}</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-tight">
                          {data.beranda.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                          {data.beranda.description}
                        </p>
                      </div>

                      <div className="lg:col-span-5">
                        <div className="rounded-2xl bg-[#0B294B] border border-white/15 p-4 sm:p-5 shadow-xl">
                          <div className="flex items-center justify-between text-[11px] text-slate-300 pb-2.5 mb-2.5 border-b border-white/10">
                            <span className="font-medium text-white flex items-center gap-1.5 truncate">
                              <Fish className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                              <span className="truncate">{data.beranda.heroCardTitle || 'Ekosistem Perairan Oepuah'}</span>
                            </span>
                            <span className="font-mono text-[10px] text-sky-300 shrink-0 ml-2">
                              {data.beranda.heroCardCoords || "09°09'S 124°35'E"}
                            </span>
                          </div>
                          {data.beranda.heroImageUrl ? (
                            <img
                              src={data.beranda.heroImageUrl}
                              alt="Hero Preview"
                              className="w-full h-44 sm:h-48 object-cover rounded-xl"
                            />
                          ) : (
                            <div className="h-40 sm:h-44 bg-[#06182E] rounded-xl flex items-center justify-center text-xs text-sky-300 font-mono">
                              [Ilustrasi Vektor Ikan Laut Otomatis]
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Kartu Metrik Preview (Fleksibel, Bersih Tanpa Grafik) */}
                  <div className="px-3 sm:px-5 -mt-6 sm:-mt-8">
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.08] shadow-sm">
                      <div className="pb-3 sm:pb-4 border-b border-black/[0.06]">
                        <h2 className="text-sm sm:text-base font-semibold text-[#1D1D1F]">{data.beranda.statsTitle}</h2>
                        <p className="text-xs text-[#86868B]">{data.beranda.statsSubtitle}</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-3 sm:mt-4">
                        {data.beranda.stats.map((stat) => (
                          <div
                            key={stat.id}
                            className="p-3.5 sm:p-4 rounded-xl bg-[#F5F5F7] border border-black/[0.05] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs text-[#86868B]">{stat.label}</span>
                                {stat.trendLabel && (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    {stat.trendLabel}
                                  </span>
                                )}
                              </div>
                              <div className="text-xl sm:text-2xl font-semibold my-1.5 sm:my-2 text-[#1D1D1F]">
                                {stat.value}
                                {stat.unit && (
                                  <span className="text-sm sm:text-base font-normal text-[#86868B] ml-1.5">
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
                  </div>
                </div>
              )}

              {/* TAB PENGURUS PREVIEW */}
              {previewTab === 'pengurus' && (
                <div className="px-4 sm:px-5 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{data.pengurusSection.title}</h2>
                    <p className="text-xs text-[#86868B] mt-1">{data.pengurusSection.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {data.pengurusSection.items.map((person) => (
                      <div
                        key={person.id}
                        className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <img
                            src={person.photoUrl}
                            alt={person.name}
                            className="w-full h-44 sm:h-48 object-cover"
                          />
                          <div className="p-4 sm:p-5">
                            <span className="text-[11px] font-medium text-[#0071E3] uppercase">
                              {person.role}
                            </span>
                            <h3 className="text-base font-semibold text-[#1D1D1F] mt-1">
                              {person.name}
                            </h3>
                          </div>
                        </div>
                        <div className="p-3.5 sm:p-4 bg-[#FAFAFC] border-t border-black/[0.06] text-xs space-y-1.5">
                          {person.phone && (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#1D1D1F] flex items-center gap-1.5 truncate">
                                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{person.phone}</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-medium shrink-0">WhatsApp</span>
                            </div>
                          )}
                          {person.email && (
                            <div className="text-[#86868B] flex items-center gap-1.5 truncate">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{person.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB MENGENAL PREVIEW */}
              {previewTab === 'mengenal' && (
                <div className="px-4 sm:px-5 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{data.mengenalKami.title}</h2>
                    <p className="text-xs text-[#86868B] mt-1">{data.mengenalKami.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-black/[0.08] shadow-sm text-xs leading-relaxed whitespace-pre-line">
                        {data.mengenalKami.narrative}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-sm">
                          <span className="text-xs font-semibold text-[#0071E3] flex items-center gap-1.5 mb-1">
                            <ShieldCheck className="w-4 h-4" /> Visi Utama
                          </span>
                          <p className="text-xs text-[#1D1D1F]">{data.mengenalKami.vision}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-sm">
                          <span className="text-xs font-semibold text-[#0071E3] flex items-center gap-1.5 mb-1">
                            <Layers className="w-4 h-4" /> Misi Strategis
                          </span>
                          <ul className="text-[11px] text-[#515154] list-disc pl-4 space-y-1">
                            {data.mengenalKami.missions.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-5">
                      <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm">
                        <img
                          src={data.mengenalKami.imageUrl}
                          alt="Sekretariat"
                          className="w-full h-44 sm:h-48 object-cover"
                        />
                        <div className="p-4 sm:p-5 space-y-2 text-xs">
                          <h4 className="font-semibold text-sm">Sekretariat Koperasi</h4>
                          <p className="text-[#515154] leading-relaxed">{data.mengenalKami.address}</p>
                          <p className="text-[#0071E3] font-medium">{data.mengenalKami.phone}</p>
                          <p className="text-[#86868B]">{data.mengenalKami.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB PRODUK PREVIEW */}
              {previewTab === 'produk' && (
                <div className="px-4 sm:px-5 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{data.produkSection.title}</h2>
                    <p className="text-xs text-[#86868B] mt-1">{data.produkSection.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {data.produkSection.items.map((prd) => (
                      <div
                        key={prd.id}
                        className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-40 sm:h-44 overflow-hidden relative bg-gray-100">
                            <img
                              src={prd.imageUrl}
                              alt={prd.name}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/75 text-white">
                              {prd.availability}
                            </span>
                          </div>
                          <div className="p-4 sm:p-5">
                            <span className="text-[10px] text-[#86868B] uppercase">{prd.category}</span>
                            <h3 className="text-base font-semibold text-[#1D1D1F] mt-0.5">
                              {prd.name}
                            </h3>
                            <p className="text-xs text-[#515154] mt-1.5 line-clamp-2">
                              {prd.description}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 sm:px-5 py-3 bg-[#FAFAFC] border-t border-black/[0.06] flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#1D1D1F]">
                            {prd.pricePerKg} <span className="text-xs font-normal text-[#86868B]">/ kg</span>
                          </span>
                          <span className="text-[11px] font-medium text-[#0071E3]">Rantai Dingin</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB PENGUMUMAN PREVIEW */}
              {previewTab === 'pengumuman' && (
                <div className="px-4 sm:px-5 pt-6 sm:pt-8 space-y-4 sm:space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold">{data.pengumumanSection.title}</h2>
                    <p className="text-xs text-[#86868B] mt-1">{data.pengumumanSection.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {data.pengumumanSection.items.map((ann) => (
                      <article
                        key={ann.id}
                        className="bg-white rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm flex flex-col justify-between"
                      >
                        {ann.imageUrl && (
                          <img
                            src={ann.imageUrl}
                            alt={ann.title}
                            className="w-full h-40 sm:h-44 object-cover"
                          />
                        )}
                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                              {ann.category}
                            </span>
                            <span className="text-[#86868B]">{ann.date}</span>
                          </div>
                          <h3 className="text-base font-semibold text-[#1D1D1F]">{ann.title}</h3>
                          <p className="text-xs text-[#515154] leading-relaxed line-clamp-3">
                            {ann.summary}
                          </p>
                        </div>
                        <div className="px-4 sm:px-5 py-3 bg-[#FAFAFC] border-t border-black/[0.06] text-xs font-semibold text-[#0071E3]">
                          Baca Warta Selengkapnya →
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}