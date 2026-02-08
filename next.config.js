/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export as static site for GitHub Pages
  output: "export",
  
  // Base path and asset prefix for GitHub Pages (repo name is 'game')
  basePath: "/game",
  assetPrefix: "/game/",
  
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
  
  // Redirect trailing slashes for proper routing
  trailingSlash: true,
};

module.exports = nextConfig;
