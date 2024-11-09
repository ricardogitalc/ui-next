/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Melhora o carregamento inicial
  experimental: {
    optimizeFonts: true,
    optimizeImages: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
