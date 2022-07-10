/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const lodash = require("lodash");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
// { file: string, fileContexts: object }
const fileContexts = [];
// { file: string, path: string, value: array_of_string }
const options = [];

module.exports.configs = {
  default: {
    plugins: ["json-value"],
    env: ["browser", "node"],
    rules: {
      "check-json-value/json-value": [
        {
          file: "",
          path: "",
          values: [],
        },
      ],
    },
  },
};

// import all rules in lib/rules
module.exports.rules = {
  "json-value": {
    meta: {
      type: "suggestion",
      schema: [
        {
          type: "object",
          properties: {
            file: { type: "string" },
            path: { type: "string" },
            values: { type: "array" },
          },
          additionalProperties: false,
        },
      ],
      fixable: "code",
    },

    create(context) {
      const checkList = [];
      let pass = true;
      let error = {};

      for (const opt of context.options) {
        if (
          "string" === typeof opt.file &&
          "string" === typeof opt.path &&
          Array.isArray(opt.values) &&
          "" !== opt.file &&
          "" !== opt.path &&
          opt.values.length > 0
        ) {
          fileContexts.push(opt);
        }
      }

      for (const context of fileContexts) {
        for (const option of options) {
          if (new RegExp(context.file).test(option.file)) {
            checkList.push(Object.assign({}, context, option));
          }
        }
      }

      for (const check of checkList) {
        const data = lodash.get(check.fileContext, check.path);

        if (undefined !== data) {
          const text = data.toString();

          for (const regstr of check.values) {
            if (!new RegExp(regstr).test(text)) {
              pass = false;
              error = lodash.pick(check, ["path", "values"]);
              break;
            }
          }
        }
      }

      if (false === pass) {
        context.report({
          ruleId: "check-json-value/json-value",
          message: `path "${
            error.path
          }" didn't match any of "${error.values.join('", "')}"`,
          loc: { start: 0, end: 0 }, // FIXME how to find out location
        });
      }

      return {};
    },
  },
};

// import processors
module.exports.processors = {
  // add your processors here
  ".json": {
    // takes text of the file and filename
    preprocess(text, filename) {
      // here, you can strip out any non-JS content
      // and split into multiple strings to lint
      try {
        options.push({ file: filename, fileContext: JSON.parse(text) });
      } catch (e) {
        // do nothing
      }

      return [""]; // XXX return nothing
    },

    // takes a Message[][] and filename
    postprocess(messages, filename) {
      // `messages` argument contains two-dimensional array of Message objects
      // where each top-level array item contains array of lint messages related
      // to the text that was returned in array from preprocess() method
      for (let i = 0, len = options.length; i < len; ++i) {
        if (filename === options[i].file) {
          options.splice(i, 1);
          --len;
        }
      }

      // you need to return a one-dimensional array of the messages you want to keep
      return messages[0];
    },

    supportsAutofix: false, // (optional, defaults to false)
  },
};
