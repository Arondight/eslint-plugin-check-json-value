# eslint-plugin-check-json-value

ESLint plugin to check value of JSON file.

This plugin provides two rules:

- **`json-lint`** — validates JSON syntax (missing quotes, trailing commas, etc.)
- **`json-value`** — validates JSON values against patterns you define (regex, literal, type)

Both rules work on `.json` files. The plugin registers a [processor](https://eslint.org/docs/latest/extend/custom-processors) that parses each JSON file into an AST, which the rules then traverse.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [ESLint 9+ (flat config)](#eslint-9-flat-config)
  - [ESLint 8 and below (legacy config)](#eslint-8-and-below-legacy-config)
- [Rules](#rules)
  - [json-lint](#json-lint)
  - [json-value](#json-value)
- [json-value Configuration Reference](#json-value-configuration-reference)
  - [file](#file)
  - [path](#path)
  - [values](#values)
  - [if (conditional checking)](#if-conditional-checking)
  - [for (loop expansion)](#for-loop-expansion)
- [Value Types](#value-types)
- [How Matching Works](#how-matching-works)
- [Examples](#examples)
- [License](#license)

## Installation

You'll first need to install [ESLint](https://eslint.org/).

```sh
npm install --save-dev eslint
```

Next, install [eslint-plugin-check-json-value](https://www.npmjs.com/package/eslint-plugin-check-json-value).

```sh
npm install --save-dev eslint-plugin-check-json-value
```

## Quick Start

### ESLint 9+ (flat config)

In your `eslint.config.js`, import the plugin and spread the `flat/recommended` config. This registers the plugin, enables `json-lint`, and wires the `.json` processor automatically.

```js
// eslint.config.js
import plugin from "eslint-plugin-check-json-value";

export default [
  ...plugin.configs["flat/recommended"],
  {
    rules: {
      "check-json-value/json-value": [
        "error",
        [
          {
            file: "member-.+\\.json",
            path: "gender",
            values: [{ type: "string", value: "^(fe)?males$" }],
          },
        ],
      ],
    },
  },
];
```

If your project uses CommonJS, name the file `eslint.config.cjs` and use `require`:

```js
const plugin = require("eslint-plugin-check-json-value");

module.exports = [
  ...plugin.configs["flat/recommended"],
  // ... your rule overrides
];
```

> **Note:** In flat config, the `.json` processor is **not** auto-applied. Always spread `flat/recommended` (or wire the processor manually) so that JSON files are parsed before the rules run.

### ESLint 8 and below (legacy config)

Add `check-json-value` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix.

```json
{
  "plugins": ["check-json-value"]
}
```

Then configure the rules you want to use:

```json
{
  "rules": {
    "check-json-value/json-lint": ["error", { "lint": true }],
    "check-json-value/json-value": [
      "error",
      [
        {
          "file": "member-.+\\.json",
          "path": "gender",
          "values": [{ "type": "string", "value": "^(fe)?males$" }]
        }
      ]
    ]
  }
}
```

Or use the `recommended` config via `extends` (enables `json-lint` only):

```json
{
  "extends": ["plugin:check-json-value/recommended"],
  "rules": {
    "check-json-value/json-value": ["error", [...]]
  }
}
```

## Rules

### json-lint

Validates JSON syntax. Reports errors such as unquoted property keys, trailing commas, and other structural issues.

**Type:** suggestion

**Options:**

```json
{
  "lint": true
}
```

| Option | Type      | Default | Description                              |
| ------ | --------- | ------- | ---------------------------------------- |
| `lint` | `boolean` | `false` | Set to `true` to enable syntax checking. |

When `lint` is `false` or omitted, the rule does nothing.

**Example:**

```json
"check-json-value/json-lint": ["error", { "lint": true }]
```

For a file with invalid JSON:

```json
{
  "id": 1,
  "text": "abadcafe"
}
```

ESLint reports:

```
2:3   error  Property keys must be doublequoted
3:21  error  Trailing comma
```

### json-value

Validates values inside JSON files against patterns you define. You can check that a specific path in a JSON file holds a value matching a regex, a literal, or a type.

**Type:** suggestion

**Options:** An array of check objects (see below).

## json-value Configuration Reference

Each element in the `json-value` options array is a check object with the following fields:

| Field    | Required | Description                                                                       |
| -------- | -------- | --------------------------------------------------------------------------------- |
| `file`   | Yes      | Regex pattern to match filenames (tested against the full path).                  |
| `path`   | Yes      | Dot/bracket notation path to the value inside the JSON.                           |
| `values` | Yes      | Array of value matchers. The value at `path` must match **at least one**.         |
| `if`     | No       | Array of conditions that must be satisfied for this check to apply.               |
| `logic`  | No       | How to combine `if` conditions: `"and"` (default, all must pass) or `"or"` (any). |
| `for`    | No       | Array of loop definitions for expanding placeholders in `path`.                   |

### file

A regex pattern string tested against the file's full path. The check only applies to files whose name matches.

```json
"file": "member-.+\\.json"
```

This matches `member-001.json`, `member-alice.json`, etc.

### path

A dot/bracket notation path that navigates the JSON AST to the target value. Supports object property access and array indexing.

```json
"path": "data.records[0].id"
```

For this JSON:

```json
{
  "data": {
    "records": [{ "id": 10000 }]
  }
}
```

The path `data.records[0].id` navigates to `10000`.

If the path does not exist in the JSON, the rule reports:

```
path "data.records[0].id" is not exists
```

### values

An array of value matchers. The value at `path` must match **at least one** matcher. Each matcher has:

| Field        | Required | Description                                                               |
| ------------ | -------- | ------------------------------------------------------------------------- |
| `type`       | Yes      | One of `"string"`, `"number"`, `"boolean"`, `"null"`, `"undefined"`.      |
| `value`      | No*      | The pattern or literal to match against. See [Value Types](#value-types). |
| `ignoreCase` | No       | If `true`, regex matching is case-insensitive. Default `false`.           |

*`value` is ignored for `type: "null"` and `type: "undefined"` (the type itself is the check).

If the value at `path` matches none of the matchers, the rule reports:

```
path "data.records[0].id" doesn't match any of [ ^\d{4,6}$ , null ]
```

### if (conditional checking)

An array of condition objects. The check only applies when the conditions are satisfied. Each condition has the same `path` + `values` structure.

By default, **all** conditions must pass (AND logic). Set `logic: "or"` to require **any** condition to pass (OR logic).

**AND (default):** all conditions must be satisfied:

```json
{
  "file": "data/record-.+\\.json",
  "path": "records[0].status",
  "values": [{ "type": "string", "value": "^active$" }],
  "if": [
    {
      "path": "records[0].verified",
      "values": [{ "type": "boolean", "value": true }]
    },
    {
      "path": "records[0].published",
      "values": [{ "type": "boolean", "value": true }]
    }
  ]
}
```

The check runs only if `verified` is `true` **AND** `published` is `true`.

**OR:** at least one condition must be satisfied:

```json
{
  "file": "data/record-.+\\.json",
  "path": "records[0].status",
  "values": [{ "type": "string", "value": "^active$" }],
  "if": [
    {
      "path": "records[0].verified",
      "values": [{ "type": "boolean", "value": true }]
    },
    {
      "path": "records[0].approved",
      "values": [{ "type": "boolean", "value": true }]
    }
  ],
  "logic": "or"
}
```

The check runs if `verified` is `true` **OR** `approved` is `true`.

If a condition's path doesn't exist in the JSON, that condition is considered **not satisfied**. With AND (default), this causes the check to be skipped. With OR, the check still runs if another condition is satisfied.

### for (loop expansion)

An array of loop definitions used to expand placeholders in the `path` field. This lets you check multiple array indices without writing each path manually.

```json
{
  "file": "data/record-.+\\.json",
  "path": "records[{{I}}].values[{{J}}]",
  "values": [{ "type": "number", "value": "^\\d+$" }],
  "for": [
    { "replace": "{{I}}", "start": 0, "end": 4, "step": 1 },
    { "replace": "{{J}}", "start": 0, "end": 3, "step": 1 }
  ]
}
```

Each `for` entry has:

| Field     | Required | Description                                  |
| --------- | -------- | -------------------------------------------- |
| `replace` | Yes      | The placeholder string to replace in `path`. |
| `start`   | Yes      | Start of the loop range (inclusive).         |
| `end`     | Yes      | End of the loop range (exclusive).           |
| `step`    | Yes      | Increment per iteration. Must be > 0.        |

The expansion produces a **Cartesian product** across all `for` entries. In the example above, `{{I}}` ranges over `0, 1, 2, 3` and `{{J}}` over `0, 1, 2`, producing 12 paths total:

```
records[0].values[0], records[0].values[1], records[0].values[2],
records[1].values[0], records[1].values[1], records[1].values[2],
records[2].values[0], records[2].values[1], records[2].values[2],
records[3].values[0], records[3].values[1], records[3].values[2]
```

Each expanded path is checked independently. If a path doesn't exist (e.g., the array is shorter), the rule reports `pathNotExists`.

## Value Types

The `type` field in a value matcher determines how `value` is interpreted:

| `type`        | How `value` is used                                                                                                                     | Example                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `"string"`    | `value` is a **regex** tested against the JSON value (must be a string).                                                                | `{ "type": "string", "value": "^mr\\..+$" }`                                                           |
| `"number"`    | If `value` is a string, it's a **regex** tested against `String(jsonValue)`. If `value` is a number, it's a **literal** equality check. | `{ "type": "number", "value": "^\\d{4,6}$" }` (regex) or `{ "type": "number", "value": 42 }` (literal) |
| `"boolean"`   | `value` is a **literal** boolean for equality check.                                                                                    | `{ "type": "boolean", "value": true }`                                                                 |
| `"null"`      | Checks if the JSON value is `null`. `value` is ignored.                                                                                 | `{ "type": "null", "value": null }`                                                                    |
| `"undefined"` | Checks if the path doesn't exist (value is undefined). `value` is ignored.                                                              | `{ "type": "undefined", "value": null }`                                                               |

Use `ignoreCase: true` to make string and number-regex matching case-insensitive.

## How Matching Works

For a given `path`, the rule checks the value against all entries in the `values` array. The value **must match at least one** matcher (OR logic):

- If **any** matcher matches → no error.
- If **none** match → reports `valueNotMatch`.
- If the **path doesn't exist** → reports `pathNotExists` (the `values` array is not checked).

When `if` conditions are present, the check only runs if the conditions are satisfied according to `logic`: `"and"` (default) requires all conditions to pass; `"or"` requires at least one. If the conditions are not met, the entire check is skipped (no error reported).

## Examples

### Check that a field matches a regex

Ensure `gender` in `member-*.json` files is `"male"` or `"female"`:

```json
{
  "file": "member-.+\\.json",
  "path": "gender",
  "values": [{ "type": "string", "value": "^(fe)?male$" }]
}
```

### Allow multiple types at one path

Allow `id` to be either a 4–6 digit number or `null`:

```json
{
  "file": "record-.+\\.json",
  "path": "data.records[0].id",
  "values": [
    { "type": "number", "value": "^\\d{4,6}$" },
    { "type": "null", "value": null }
  ]
}
```

### Check only when a condition is met

Require `status` to be `"active"` only when `verified` is `true`:

```json
{
  "file": "record-.+\\.json",
  "path": "status",
  "values": [{ "type": "string", "value": "^active$" }],
  "if": [
    {
      "path": "verified",
      "values": [{ "type": "boolean", "value": true }]
    }
  ]
}
```

### Check when any of multiple conditions is met (OR)

Require `status` to be `"active"` when `verified` **or** `approved` is `true`:

```json
{
  "file": "record-.+\\.json",
  "path": "status",
  "values": [{ "type": "string", "value": "^active$" }],
  "if": [
    {
      "path": "verified",
      "values": [{ "type": "boolean", "value": true }]
    },
    {
      "path": "approved",
      "values": [{ "type": "boolean", "value": true }]
    }
  ],
  "logic": "or"
}
```

### Check all array elements with `for`

Ensure every `values[j]` in `records[i]` is a number, for `i` in `0..3` and `j` in `0..2`:

```json
{
  "file": "record-.+\\.json",
  "path": "records[{{I}}].values[{{J}}]",
  "values": [{ "type": "number", "value": "^\\d+$" }],
  "for": [
    { "replace": "{{I}}", "start": 0, "end": 4, "step": 1 },
    { "replace": "{{J}}", "start": 0, "end": 3, "step": 1 }
  ]
}
```

### Case-insensitive string matching

Match `"Mr. Cat"` or `"mr. cat"`:

```json
{
  "type": "string",
  "value": "^mr\\.\\s*cat$",
  "ignoreCase": true
}
```

### Full configuration example

```json
[
  {
    "file": "member-.+\\.json",
    "path": "gender",
    "values": [{ "type": "string", "value": "^(fe)?males$" }]
  },
  {
    "file": "data/record-201[0-9]\\.json",
    "path": "records[{{COUNTER1}}].items[{{COUNTER2}}]",
    "values": [{ "type": "number", "value": "^\\d{4,6}$" }],
    "if": [
      {
        "path": "status",
        "values": [
          { "type": "string", "value": "^need confirm$", "ignoreCase": true },
          { "type": "string", "value": "^unconfirmed$", "ignoreCase": true }
        ]
      },
      {
        "path": "complete",
        "values": [{ "type": "boolean", "value": true }]
      }
    ],
    "for": [
      { "replace": "{{COUNTER1}}", "start": 0, "end": 10, "step": 1 },
      { "replace": "{{COUNTER2}}", "start": 0, "end": 20, "step": 10 }
    ]
  }
]
```

See the [rule schemas](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/lib/rules/meta/json_value.js) for the full JSON Schema definition, and the [unit tests](https://github.com/Arondight/eslint-plugin-check-json-value/tree/master/tests/lib/rules) for more usage examples.

## License

[MIT License](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/LICENSE).
