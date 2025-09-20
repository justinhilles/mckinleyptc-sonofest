import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Align routing with Netlify redirects that enforce trailing slashes to avoid loops
  trailingSlash: true,
};

export default nextConfig;
