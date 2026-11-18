import { defineConfig } from "vitest/config";

// The root runs only the tests of the library. The site in site/ has its own config, and the root test script starts it
// after the library. Without this include, the root run also starts the site tests, and the coverage of the root counts
// the site sources.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
