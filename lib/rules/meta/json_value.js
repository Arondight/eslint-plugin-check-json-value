/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

module.exports = {
  type: "suggestion",
  docs: {
    description: "check value of JSON file",
    category: "Possible Problems",
    recommended: false,
    url: "https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/lib/rules/meta/json_value.js",
  },
  messages: {
    pathNotExists: 'path "{{ path }}" is not exists',
    valueNotMatch: 'path "{{ path }}" doesn\'t match any of {{ values }}',
  },
  schema: [
    {
      type: "array",
      items: {
        type: "object",
        properties: {
          file: { type: "string" },
          path: { type: "string" },
          values: {
            type: "array",
            items: {
              type: "object",
              properties: {
                value: {
                  anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
                },
                type: {
                  enum: ["string", "number", "boolean", "null", "undefined"],
                },
                ignoreCase: { type: "boolean" },
              },
              required: ["type"],
              additionalProperties: false,
            },
          },
          if: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                values: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      value: {
                        anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }, { type: "null" }],
                      },
                      type: {
                        enum: ["string", "number", "boolean", "null", "undefined"],
                      },
                      ignoreCase: { type: "boolean" },
                    },
                    required: ["type"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["path", "values"],
              additionalProperties: false,
            },
          },
          for: {
            type: "array",
            items: {
              type: "object",
              properties: {
                replace: { type: "string" },
                start: { type: "number" },
                end: { type: "number" },
                step: { type: "number" },
              },
              required: ["replace", "start", "end", "step"],
              additionalProperties: false,
            },
          },
          logic: { enum: ["and", "or"] },
        },
        required: ["file", "path", "values"],
        additionalProperties: false,
      },
      additionalItems: false,
    },
  ],
};
