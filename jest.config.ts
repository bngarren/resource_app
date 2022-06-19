import type { InitialOptionsTsJest } from "ts-jest";

const config: InitialOptionsTsJest = {
  testEnvironment: "node",
  verbose: true,
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
export default config;
