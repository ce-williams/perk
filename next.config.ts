import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // GitHub project Pages lives under /<repo>; local previews stay at /.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};
export default config;
