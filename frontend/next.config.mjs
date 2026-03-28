/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add this block to kill the "N" logo forever!
  devIndicators: {
    buildActivity: false, 
  },
}

export default nextConfig