# eslint-plugin-check-json-value

ESLint plugin to check value of JSON file.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-check-json-value`:

```sh
npm install eslint-plugin-check-json-value --save-dev
```

## Usage

Add `check-json-value` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["check-json-value"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "check-json-value/json-value": [
      "error",
      {
        "file": "data/record-202[1-2]\\.json",
        "path": "data.records[0].id",
        "values": ["^\\d{4,6}$", "^null$"]
      }
    ]
  }
}
```

## Supported Rules

- Fill in provided rules here
