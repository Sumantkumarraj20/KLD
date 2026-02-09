/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. MUST match your repository name exactly
  basePath: "/game",

  // 2. FIXED: assetPrefix should NOT have a trailing slash here
  // because Next.js adds its own paths. Also, using a conditional
  // check ensures local development (npm run dev) doesn't break.
  assetPrefix: process.env.NODE_ENV === "production" ? "/game" : "",

  // 3. Required for GitHub Pages
  output: "export",

  // 4. FIXED: Set to false or handle carefully. GitHub Pages handles
  // directory indexing better when this is false for static exports.
  trailingSlash: false,

  // 5. Mandatory for GitHub Pages as it doesn't support the Next.js Image Optimizer
  images: {
    unoptimized: true,
  },

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
};

module.exports = nextConfig;
