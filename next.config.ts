import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  htmlLimitedBots: /.*/,
  experimental: {
    useTypeScriptCli: false,
    workerThreads: true,
  },
};

export default config;
