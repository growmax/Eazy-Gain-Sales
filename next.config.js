const runtimeCaching = require("next-pwa/cache");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.s3.ap-northeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**.s3.ap-south-1.amazonaws.com",
      },
    ],
    domains: [
      "redingtonb2b.in",
      "s3-ap-northeast-1.amazonaws.com",
      "cdn.shopify.com",
    ],
  },
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material/{{member}}",
    },
    "@mui/lab": {
      transform: "@mui/lab/{{member}}",
    },
    lodash: {
      transform: "lodash/{{member}}",
    },
  },
};
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  runtimeCaching,
  sw: "service-worker.js",
  mode: "production",
});
module.exports = withPWA(nextConfig);
