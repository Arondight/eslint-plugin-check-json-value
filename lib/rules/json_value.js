/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const lodash = require("lodash");
const { allEmpty, noneEmpty } = require("../utils");

function factory(options) {
  function getIfResult(context, option) {
    let result = true;

    if (!Array.isArray(context.if)) {
      return result;
    }

    for (const config of context.if) {
      const { path, values } = config || {};
      const data = lodash.get(option.document, path);

      if (undefined === data) {
        result = false;
        break;
      }

      if (
        "string" === typeof path &&
        Array.isArray(values) &&
        noneEmpty(path, values)
      ) {
        let match = true;

        for (const regstr of values) {
          if (!new RegExp(regstr).test(String(data))) {
            match = false;
            break;
          }
        }

        if (false === match) {
          result = false;
          break;
        }
      }
    }

    return result;
  }

  function extendFor(context) {
    const extended = [];

    if (!Array.isArray(context.for)) {
      return extended;
    }

    extended.push(context);

    for (const config of context.for) {
      const { replace, start, end, step } = config || {};

      if (
        "string" === typeof replace &&
        "number" === typeof start &&
        "number" === typeof end &&
        "number" === typeof step &&
        noneEmpty(replace) &&
        end > start
      ) {
        for (let i = extended.length; i > 0; --i) {
          const context = extended.shift();

          for (let j = start; j < end; j += step) {
            extended.push(
              Object.assign({}, context, {
                path: context.path.replace(replace, String(j)),
              })
            );
          }
        }
      }
    }

    return extended;
  }

  return function (context) {
    const fileContexts = [];
    const checkList = [];

    for (const contextOptionList of context.options) {
      for (const contextOption of contextOptionList) {
        const { file, path, values } = contextOption;

        if (
          "string" === typeof file &&
          "string" === typeof path &&
          Array.isArray(values) &&
          noneEmpty(file, path, values)
        ) {
          fileContexts.push(contextOption);
        }
      }
    }

    for (const context of fileContexts) {
      for (const option of options) {
        if (!getIfResult(context, option)) {
          break;
        }

        const extended = [...extendFor(context)];

        if (allEmpty(extended)) {
          extended.push(context);
        }

        for (const item of extended) {
          if (new RegExp(item.file).test(option.file)) {
            checkList.push(Object.assign({}, item, option));
          }
        }
      }
    }

    for (const item of checkList) {
      const data = lodash.get(item.document, item.path);

      if (undefined === data) {
        context.report({
          ruleId: "check-json-value/json-value",
          messageId: "pathNotExists",
          data: { path: item.path },
          loc: { start: 0, end: 0 }, // FIXME how to find out location
        });
      } else {
        for (const regstr of item.values) {
          if (!new RegExp(regstr).test(String(data))) {
            context.report({
              ruleId: "check-json-value/json-value",
              messageId: "valueNotMatch",
              data: { path: item.path, values: item.values.join('", "') },
              loc: { start: 0, end: 0 }, // FIXME how to find out location
            });
          }
        }
      }
    }

    return {};
  };
}

module.exports = {
  meta: {
    type: "suggestion",
    messages: {
      pathNotExists: 'path "{{ path }}" is not exists',
      valueNotMatch: 'path "{{ path }}" doesn\'t match any of {{ values }}',
    },
    schema: [
      {
        type: "array",
        properties: [
          {
            file: { type: "string" },
            path: { type: "string" },
            values: { type: "array" },
            if: {
              type: "array",
              properties: [
                {
                  path: { type: "string" },
                  values: { type: "array" },
                },
              ],
            },
            for: {
              type: "array",
              properties: [
                {
                  replace: { type: "string" },
                  start: { type: "number" },
                  end: { type: "number" },
                  step: { type: "number" },
                },
              ],
            },
          },
        ],
        additionalProperties: false,
      },
    ],
    fixable: "code",
  },

  create(options) {
    return {
      meta: this.meta,
      create: factory(options),
    };
  },
};
