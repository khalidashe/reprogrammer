import { defineConfig } from "vitest/config";

/**
 * Vitest config for the Convex server tests (REP-48).
 *
 * Scoped to `convex/**` only — the `services/__tests__/*.test.ts` files are
 * standalone `tsx` self-tests (run via `npm test`), not Vitest specs, so they
 * are deliberately excluded here.
 *
 * `convex-test` runs the functions in an in-memory backend, which needs the
 * edge-runtime environment. It also requires the generated API, so run
 * `npx convex codegen` (or `npx convex dev`) once before `npm run test:convex`.
 */
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
