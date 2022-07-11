# eslint-plugin-check-json-value

ESLint plugin to check value of JSON file.

## Installation

You'll first need to install [ESLint](https://eslint.org/).

```sh
npm install --save-dev eslint
```

Next, install `eslint-plugin-check-json-value`.

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
    ]
    "check-json-value/json-value": [
      "error",
      [
        {
          "file": "data/record-202[1-2]\\.json",
          "path": "data.records[0].id",
          "values": ["^\\d{4,6}$", "^null$"]
        }
      ]
    ]
  }
}
```

## LICENSE

[MIT License](https://github.com/Arondight/eslint-plugin-check-json-value/blob/master/LICENSE).
