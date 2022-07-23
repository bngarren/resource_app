import type { InitialOptionsTsJest } from "ts-jest";

const config: InitialOptionsTsJest = {
  testEnvironment: "node",
  verbose: true,
  preset: "ts-jest",
  setupFiles: ["dotenv/config", "<rootDir>/tests/setup-tests.ts"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  testPathIgnorePatterns: [".d.ts", ".js"],
};
export default config;
