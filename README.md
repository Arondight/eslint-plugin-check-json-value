# eslint-plugin-check-json-value

ESLint plugin to check value of JSON file

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
    "check-json-value/rule-name": 2
  }
}
```

## Supported Rules

- Fill in provided rules here
