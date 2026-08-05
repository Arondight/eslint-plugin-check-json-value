/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const PLUGIN_PATH = path.resolve(__dirname, "..", "lib", "index.js");

// Detect the installed eslint major so the runner can pick the right invocation
// shape. eslint 8.x needs ESLINT_USE_FLAT_CONFIG=true and lacks --no-config-lookup
// (both are 9+). When eslint can't be resolved (e.g. PATH-only install), assume 9+
// (flat-native), which is the safe default for the dev environment.
function getEslintMajor() {
  try {
    return Number(require("eslint/package.json").version.split(".")[0]);
  } catch {
    return Infinity;
  }
}

// Build flat-config source from a legacy .eslintrc.json fixture.
// The plugin is sanitized to {meta, rules, processors} (no `configs`) to break
// the self-referential cycle plugin -> configs["flat/recommended"] -> plugin,
// which eslint 8.x's flat-config loader serializes (raising "circular structure").
// String processor references are rewritten to the object form for 8.x compat.
function buildFlatConfigCode(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

  const sanitize = `const _plugin = require(${JSON.stringify(PLUGIN_PATH)});
const plugin = { meta: _plugin.meta, rules: _plugin.rules, processors: _plugin.processors };`;

  if (Array.isArray(config.extends) && config.extends.includes("plugin:check-json-value/recommended")) {
    return `${sanitize}
module.exports = _plugin.configs["flat/recommended"].map((c) => {
  const out = { ...c };
  if (c.plugins) out.plugins = { "check-json-value": plugin };
  if (typeof c.processor === "string") out.processor = plugin.processors.json;
  return out;
});`;
  }

  const rules = config.rules || {};
  return `${sanitize}
module.exports = [
  {
    plugins: { "check-json-value": plugin },
    rules: ${JSON.stringify(rules, null, 2)}
  },
  {
    files: ["**/*.{json,jsonc}"],
    processor: plugin.processors.json
  }
];`;
}

// Normalize eslint's JSON-formatter output to a stable shape across versions.
// - strip `nodeType` (eslint 8/9 inject `nodeType: null` for node-less reports;
//   eslint 10 omits it). The plugin never passes a node, so this field is always
//   formatter-injected noise, not a plugin signal.
// - ensure line/column/endLine/endColumn are present. eslint 8/9 omit these
//   fields when the location is null; eslint 10 includes them as null. Filling
//   nulls lets the test expectations (which pin the 10.x shape) match everywhere.
function normalize(result) {
  if (!Array.isArray(result)) return result;
  for (const file of result) {
    if (!Array.isArray(file.messages)) continue;
    file.messages = file.messages.map((m) => {
      const rest = { ...m };
      delete rest.nodeType;
      return { line: null, column: null, endLine: null, endColumn: null, ...rest };
    });
  }
  return result;
}

module.exports = function (configPath, ...rest) {
  const major = getEslintMajor();
  const configCode = buildFlatConfigCode(configPath);
  const tempConfig = path.join(os.tmpdir(), `eslint-test-${process.pid}-${Date.now()}.cjs`);

  const useFlatEnv = major < 9;
  const args = useFlatEnv
    ? ["eslint", "-f", "json", "--config", tempConfig, ...rest]
    : ["eslint", "-f", "json", "--no-config-lookup", "--config", tempConfig, ...rest];
  const env = useFlatEnv ? { ...process.env, ESLINT_USE_FLAT_CONFIG: "true" } : process.env;

  try {
    fs.writeFileSync(tempConfig, configCode);

    const cmd = os.type().includes("Windows") ? "npx.cmd" : "npx";
    const spawnResult = spawnSync(cmd, args, { encoding: "utf8", env });

    if (spawnResult.error) {
      throw new Error(`eslint spawn failed: ${spawnResult.error.message}`);
    }

    const stdout = String(spawnResult.stdout);

    try {
      return normalize(JSON.parse(stdout));
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
