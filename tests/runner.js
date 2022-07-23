/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
const os = require("os");
const { spawnSync } = require("child_process");

module.exports = function (config, ...rest) {
  const cmd = os.type().includes("Windows") ? "npx.cmd" : "npx";
  const args = ["eslint", "-f", "json", "-c", config, ...rest];
  const options = { encoding: "utf8" };
  const process = spawnSync(cmd, args, options);
  let result = {};

  try {
    result = JSON.parse(String(process.stdout));
  } catch (e) {
    // do nothing
  }

  return result;
};
