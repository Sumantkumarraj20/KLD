/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  productionBrowserSourceMaps: false,
  staticPageGenerationTimeout: 60,

  // Image optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
