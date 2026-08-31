import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "bcryptjs"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@heroui/react",
      "@heroui/styles",
      "@iconify/react",
      "@base-ui/react",
      "react-aria",
      "react-aria-components",
      "@react-aria/i18n",
      "@react-aria/ssr",
      "@react-aria/utils",
      "tailwind-variants",
      "zod",
    ],
  },
};

export default nextConfig;
