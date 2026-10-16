import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center px-4 font-sans text-[#1D1D1F]">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-black/[0.08] shadow-sm text-center">
        <span className="text-4xl font-bold text-[#0071E3] block mb-2">404</span>
        <h1 className="text-xl font-semibold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-[#86868B] mb-6">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-medium text-white bg-[#0071E3] hover:bg-[#0077ED] transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

