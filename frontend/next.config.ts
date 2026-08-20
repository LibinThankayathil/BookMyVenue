import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // Allow avatar images served from auth-service CDN / storage
        protocol: "https",
        hostname: "*.bookmyvenue.com",
      },
    ],
  },

  // Expose service URLs to client via public env vars (non-secret)
  env: {
    NEXT_PUBLIC_APP_NAME: "BookMyVenue",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },

  // Rewrite /api/v1/* to API routes — handled internally by App Router.
  // The actual proxying to microservices happens in route handlers.
  async rewrites() {
    return [];
  },
};

export default nextConfig;
