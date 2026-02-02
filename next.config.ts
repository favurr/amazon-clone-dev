import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        // This allows any path under your ImageKit ID
        pathname: "/**", 
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
  },
};

export default nextConfig;
