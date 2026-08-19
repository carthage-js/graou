/** @jest-config-loader ts-node */

import { defineConfig } from "jest";

export default defineConfig({
  preset: "ts-jest",
  verbose: true,
  moduleNameMapper: {
    "^[$]project/(.*)$": "<rootDir>/src/$1",
  },
});
