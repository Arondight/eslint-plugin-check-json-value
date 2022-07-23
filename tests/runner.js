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
  let result = {};

  try {
    result = JSON.parse(String(spawnSync(cmd, args, options).stdout));
  } catch (e) {
    console.error(e);
  }

  return result;
};
