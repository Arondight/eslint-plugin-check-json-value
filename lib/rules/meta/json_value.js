/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

module.exports = {
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
          values: {
            type: "array",
            properties: [
              {
                value: { type: "object" },
                type: { type: "string" },
                ignoreCase: { type: "boolean" },
              },
            ],
          },
          if: {
            type: "array",
            properties: [
              {
                path: { type: "string" },
                values: {
                  type: "array",
                  properties: [
                    {
                      value: { type: "object" },
                      type: { type: "string" },
                      ignoreCase: { type: "boolean" },
                    },
                  ],
                },
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
};
