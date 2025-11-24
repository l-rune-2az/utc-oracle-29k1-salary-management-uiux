/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize oracledb for server-side (native module)
      config.externals = config.externals || [];
      config.externals.push('oracledb');
    }
    return config;
  },
}

module.exports = nextConfig

