import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    // Use projects for different environments in Vitest 3.x
    projects: [
      {
        test: {
          name: "node",
          globals: true,
          include: ["**/*.test.ts"],
          exclude: ["**/*.jsdom.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "jsdom",
          globals: true,
          include: ["**/*.jsdom.test.ts"],
          environment: "jsdom",
        },
      },
    ],
  },
});
