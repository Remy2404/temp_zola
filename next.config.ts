import type { NextConfig } from "next"

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
})

const baseConfig: NextConfig = {
  output: "standalone",
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "@radix-ui/react-*"],
    nodeMiddleware: true,
    // Enable build performance optimizations
    webpackBuildWorker: true,
    optimizeCss: true,
  },
  serverExternalPackages: ["shiki", "vscode-oniguruma"],
  // Performance optimizations
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimize images
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Production security and performance
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Bundle analysis for production
  ...(process.env.ANALYZE === "true" && {
    bundleAnalyzer: {
      enabled: true,
      openAnalyzer: false,
    },
  }),
}

const nextConfig: NextConfig = withBundleAnalyzer({
  ...baseConfig,
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Enable faster refresh
    fastRefresh: true,
    // Reduce bundle size in dev
    experimental: {
      ...baseConfig.experimental,
      // Enable faster builds
      webpackBuildWorker: true,
      // Optimize CSS
      optimizeCss: true,
    },
    // Disable some checks in dev for speed
    typescript: {
      ignoreBuildErrors: true,
    },
  }),
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Enable production optimizations
    swcMinify: true,
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
    experimental: {
      ...baseConfig.experimental,
      // Enable additional production optimizations
      scrollRestoration: true,
      optimizeServerReact: true,
    },
  }),
})

export default nextConfig
