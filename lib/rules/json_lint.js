/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const factory = require("./create/factory/json_lint.js");
/* eslint-disable-next-line eslint-plugin/prefer-message-ids,
                            eslint-plugin/require-meta-type,
                            eslint-plugin/require-meta-schema
*/
const meta = require("./meta/json_lint.js");

module.exports = {
  meta,

  create(options) {
    return {
      meta: this.meta,
      create: factory(options),
    };
  },
};
