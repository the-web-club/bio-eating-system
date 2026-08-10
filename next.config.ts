import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma runs through @prisma/adapter-mariadb (engineType = "client"), so
  // there is no native query-engine binary to file-trace into the Lambda.
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/favicon.svg",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
