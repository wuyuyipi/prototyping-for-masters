import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      {
        source: "/prototypes/skills",
        destination: "/prototypes/doodle-creator",
        permanent: false,
      },
      {
        source: "/skills",
        destination: "/prototypes/doodle-creator",
        permanent: false,
      },
      {
        source: "/prototypes/using-skills",
        destination: "/prototypes/doodle-creator",
        permanent: false,
      },
      {
        source: "/using-skills",
        destination: "/prototypes/doodle-creator",
        permanent: false,
      },
      {
        source: "/doodle-creator",
        destination: "/prototypes/doodle-creator",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
