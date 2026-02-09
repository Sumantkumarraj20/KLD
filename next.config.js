/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // This is critical for GitHub Pages level-routing
  trailingSlash: true,
};

module.exports = nextConfig;
