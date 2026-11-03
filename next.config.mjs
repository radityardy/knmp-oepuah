/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Wajib agar di VPS 512MB hanya butuh ~60MB RAM
  poweredByHeader: false, // Menyembunyikan header X-Powered-By untuk keamanan
  images: {
    unoptimized: true, // Mematikan worker image-optimizer bawaan yang boros CPU/RAM di VPS kecil
  },
};

export default nextConfig;
