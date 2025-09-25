import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Align routing with Netlify redirects that enforce trailing slashes to avoid loops
  trailingSlash: true,
  experimental: {
    // Enable CSS optimization/minification during production builds
    optimizeCss: true,
    // Ensure Turbopack applies JS minification in both dev and build modes
    turbopackMinify: true,
  },
};

export default nextConfig;
