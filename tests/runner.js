/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const PLUGIN_PATH = path.resolve(__dirname, "..", "lib", "index.js");

function buildFlatConfigCode(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  if (Array.isArray(config.extends) && config.extends.includes("plugin:check-json-value/recommended")) {
    return `const plugin = require(${JSON.stringify(PLUGIN_PATH)});
module.exports = plugin.configs["flat/recommended"];`;
  }

  const rules = config.rules || {};
  return `const plugin = require(${JSON.stringify(PLUGIN_PATH)});
module.exports = [
  {
    plugins: { "check-json-value": plugin },
    rules: ${JSON.stringify(rules, null, 2)}
  },
  {
    files: ["**/*.json"],
    processor: plugin.processors.json
  }
];`;
}

module.exports = function (configPath, ...rest) {
  const configCode = buildFlatConfigCode(configPath);
  const tempConfig = path.join(os.tmpdir(), `eslint-test-${process.pid}-${Date.now()}.cjs`);

  try {
    fs.writeFileSync(tempConfig, configCode);

    const cmd = os.type().includes("Windows") ? "npx.cmd" : "npx";
    const args = ["eslint", "-f", "json", "--no-config-lookup", "--config", tempConfig, ...rest];
    const spawnResult = spawnSync(cmd, args, { encoding: "utf8" });

    if (spawnResult.error) {
      throw new Error(`eslint spawn failed: ${spawnResult.error.message}`);
    }

    const stdout = String(spawnResult.stdout);

    try {
      return JSON.parse(stdout);
    } catch (e) {
      const stderr = String(spawnResult.stderr || "").trim();
      throw new Error(
        `eslint did not return JSON (exit ${spawnResult.status}).${
          stderr ? ` stderr: ${stderr}` : ""
        } stdout head: ${stdout.slice(0, 200)}`,
        { cause: e }
      );
    }
  } finally {
    try {
      fs.unlinkSync(tempConfig);
    } catch {
      // temp cleanup is best-effort
    }
  }
};
