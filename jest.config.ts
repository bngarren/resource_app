import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
};
export default config;
