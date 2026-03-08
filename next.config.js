/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'svs.gsfc.nasa.gov',
      },
    ],
  },
  // Next.js 15 routes the appPagesBrowser webpack layer to its internal React 19
  // canary, but react-reconciler@0.27.0 (used by @react-three/fiber v8) depends
  // on React 18's __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.
  // Adding a module-level rule for react-reconciler that overrides the react$
  // alias back to the project's React 18 singleton fixes the runtime error:
  // "Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')".
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /node_modules[\\/]react-reconciler[\\/]/,
        resolve: {
          alias: {
            'react$': require.resolve('react'),
            'react-dom$': require.resolve('react-dom'),
          },
        },
      });
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
