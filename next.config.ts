import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    domains: ['googleusercontent.com'], // This line is crucial for external images
  },
  
};

export default nextConfig;
