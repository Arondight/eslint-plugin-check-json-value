/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const jsonService = require("vscode-json-languageservice");
const lodash = require("lodash");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------
const jsonServiceHandle = jsonService.getLanguageService({});
// { file: string, path: string, value: array_of_string }
const options = [];

module.exports.configs = {
  ecommended: {
    plugins: ["json-lint"],
    env: ["browser", "node"],
    rules: {
      "check-json-value/json-lint": ["error", { lint: true }],
    },
  },
};

// import all rules in lib/rules
module.exports.rules = {
  "json-lint": {
    meta: {
      type: "suggestion",
      schema: [
        {
          type: "object",
          properties: {
            lint: true,
          },
          additionalProperties: false,
        },
      ],
      fixable: "code",
    },

    create(context) {
      const fileContexts = [];
      const checkList = [];

      for (const option of context.options) {
        if (true === option.lint) {
          fileContexts.push(option);
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
        if (
          Array.isArray(check.documentRich.syntaxErrors) &&
          check.documentRich.syntaxErrors.length > 0
        ) {
          for (const error of check.documentRich.syntaxErrors) {
            context.report({
              ruleId: "check-json-value/json-lint",
              message: error.message,
              loc: {
                start: {
                  line: error.range.start.line + 1,
                  column: error.range.start.character,
                },
                end: {
                  line: error.range.end.line + 1,
                  column: error.range.end.character,
                },
              },
            });
          }
        }
      }

      return {};
    },
  },
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
      const fileContexts = [];
      const checkList = [];
      let pass = true;
      let error = {};

      for (const option of context.options) {
        if (
          "string" === typeof option.file &&
          "string" === typeof option.path &&
          Array.isArray(option.values) &&
          "" !== option.file &&
          "" !== option.path &&
          option.values.length > 0
        ) {
          fileContexts.push(option);
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
        const data = lodash.get(check.document, check.path);

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
      const documentRich = jsonServiceHandle.parseJSONDocument(
        jsonService.TextDocument.create(filename, "json", 1, text)
      );
      const option = { file: filename, documentRich };

      try {
        option.document = JSON.parse(text);
      } catch (e) {
        // do nothing
      }

      options.push(option);

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
