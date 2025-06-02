
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Add this line to enable static export
 assetPrefix:
 process.env.npm_lifecycle_event === 'build-github' ? 'https://michaelhabib.github.io/GenericIdelGame_FireBase/' : '',
 distDir: 'docs', // Change the output directory to 'docs'
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true, // Allow SVGs
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // Required for static export with next/image
  },
};

export default nextConfig;
