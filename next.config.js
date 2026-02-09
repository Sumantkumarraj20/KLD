/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/game",
  // Ensure assetPrefix does NOT have a trailing slash
  assetPrefix: "/game",
  images: {
    unoptimized: true,
  },
  // This is critical for GitHub Pages level-routing
  trailingSlash: true,
};

module.exports = nextConfig;
