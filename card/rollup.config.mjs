import { readFileSync } from "node:fs";

import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url)));
const dev = process.env.ROLLUP_WATCH === "true";

/**
 * The bundle is written straight into the integration so that the cards ship
 * with it. `dist/` exists as well for people who prefer a plain Lovelace
 * resource or a HACS "Dashboard" install.
 */
const outputs = [
  "../custom_components/weight_goal/www/weight-goal-card.js",
  "dist/weight-goal-card.js",
];

export default {
  input: "src/main.ts",
  output: outputs.map((file) => ({
    file,
    format: "es",
    sourcemap: dev,
    // Home Assistant loads one file, so the lazily imported editors have to
    // live in it rather than in side chunks it would never fetch.
    inlineDynamicImports: true,
    banner: `/*! weight-goal-card ${pkg.version} | MIT | https://github.com/julezdean/ha-weight-goal */`,
  })),
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      noEmit: false,
      declaration: false,
      include: ["src/**/*.ts"],
    }),
    !dev &&
      terser({
        ecma: 2021,
        format: { comments: /^!/ },
      }),
  ].filter(Boolean),
};
