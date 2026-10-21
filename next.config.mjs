/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the regular Next.js server available for local builds.
  ...(process.env.NEXT_STATIC_EXPORT === "1" ? { output: "export" } : {}),
  images: { unoptimized: true },
};
export default nextConfig;
