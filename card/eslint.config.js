/**
 * Flat config; ESLint 9 dropped `.eslintrc`, and this project never had one.
 *
 * Type aware rules are deliberately left out: `npm run typecheck` already runs
 * the compiler over the same files, so asking ESLint to build the program a
 * second time would double the work for rules the compiler covers.
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      // TypeScript resolves identifiers itself and knows the DOM; the core
      // rule has no such knowledge and would report every browser global.
      "no-undef": "off",
      // A card logs to the console of every dashboard that shows it. The one
      // deliberate exception is the version banner in main.ts.
      "no-console": "error",
    },
  },
  {
    // This test imports the built bundle and talks to it the way a browser
    // does: no types, on purpose. Typing the calls would test the sources
    // again instead of the file that actually ships.
    files: ["test/bundle.test.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);
