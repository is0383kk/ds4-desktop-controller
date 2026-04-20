#!/usr/bin/env node
const { resolve } = require("path");
const { spawnSync } = require("child_process");

const tsxBin = resolve(__dirname, "../node_modules/.bin/tsx");
const entry  = resolve(__dirname, "../src/index.ts");

const result = spawnSync(tsxBin, [entry], {
  stdio: "inherit",
  cwd: resolve(__dirname, ".."),
  shell: true,
});

process.exit(result.status ?? 1);
