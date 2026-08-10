import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma's query engine is a native .so/.dll that Turbopack does not always
  // pull into the serverless trace when the client lives outside node_modules
  // (src/generated/prisma). Explicit includes keep the RHEL engine in the
  // Vercel function bundle; without them, runtime fails with
  // "Could not locate the Query Engine for runtime rhel-openssl-3.0.x".
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
    "/api/**/*": ["./src/generated/prisma/**/*"],
    "/portal/**/*": ["./src/generated/prisma/**/*"],
    "/sign-in/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
