# eslint-plugin-check-json-value

ESLint plugin to check value of JSON file.

## Installation

You'll first need to install [ESLint](https://eslint.org/).

```sh
npm install --save-dev eslint
```

Next, install [eslint-plugin-check-json-value](https://www.npmjs.com/package/eslint-plugin-check-json-value).

```sh
npm install --save-dev eslint-plugin-check-json-value
```

## Usage

Add `check-json-value` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix.

```json
{
  "plugins": ["check-json-value"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "check-json-value/json-lint": [
      "error",
      {
        "lint": true
      }
    ],
    "check-json-value/json-value": [
      "error",
      [
        {
          "file": "member-.+\\.json",
          "path": "gender",
          "values": [
            {
              "type": "string",
              "value": "^(fe)?males$",
              "ignoreCase": false
            }
          ]
        },
        {
          "file": "data/record-201[0-9]\\.json",
          "path": "records[{{COUNTER1}}].items[{{COUNTER2]}}",
          "values": [
            {
              "type": "number",
              "value": "^\\d{4,6}$",
              "ignoreCase": false
            }
          ],
          "if": [
            {
              "path": "status",
              "values": [
                {
                  "type": "string",
                  "value": "^NEED CONFIRM$",
                  "ignoreCase": true
                },
                {
                  "type": "string",
                  "value": "^UNCONFIRMED$",
                  "ignoreCase": true
                }
              ]
            },
            {
              "path": "complete",
              "values": [
                {
                  "type": "boolean",
                  "value": true,
                  "ignoreCase": false
                }
              ]
            }
          ],
          "for": [
            {
              "replace": "{{COUNTER1}}",
              "start": 0,
              "end": 10,
              "step": 1
            },
            {
              "replace": "{{COUNTER2}}",
              "start": 0,
              "end": 20,
              "step": 10
            }
          ]
        }
      ]
    ]
  }
}
```

See schemas of rules [check-json-value/json-lint](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/lib/rules/meta/json_lint.js) and [check-json-value/json-value](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/lib/rules/meta/json_value.js). Also here are [examples of usage in unit tests](https://github.com/Arondight/eslint-plugin-check-json-value/tree/master/tests/lib/rules) for rules.

## LICENSE

[MIT License](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/LICENSE).
