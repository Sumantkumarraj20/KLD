/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // MUST match the repository name 'KLD'
  basePath: "/KLD",
  // This ensures CSS and JS point to /KLD/_next/...
  assetPrefix: "/KLD",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
