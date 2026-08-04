/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const jsonService = require("vscode-json-languageservice");
const { parse } = require("@anchan828/json-ast");

const jsonServiceHandle = jsonService.getLanguageService({});

function preprocessFactory(options) {
  // takes text of the file and filename
  return function (text, filename) {
    // here, you can strip out any non-JS content
    // and split into multiple strings to lint
    const option = {
      file: filename,
      document: jsonServiceHandle.parseJSONDocument(jsonService.TextDocument.create(filename, "json", 1, text)),
    };

    try {
      option.documentVerbose = parse(text, { verbose: true, junker: false });
    } catch {
      // parse failure leaves documentVerbose undefined; the json-lint rule
      // separately reports syntax errors, so silent catch is intentional.
    }

    options.push(option);

    return [""]; // XXX return nothing
  };
}

function postprocessFactory(options) {
  // takes a Message[][] and filename
  return function (messages, filename) {
    // `messages` argument contains two-dimensional array of Message objects
    // where each top-level array item contains array of lint messages related
    // to the text that was returned in array from preprocess() method
    for (let i = 0, len = options.length; i < len; ++i) {
      if (filename === options[i].file) {
        options.splice(i, 1);
        // One preprocess entry per filename: splicing shifts the next element
        // into index i, so break instead of continuing to avoid skipping it.
        break;
      }
    }

    // you need to return a one-dimensional array of the messages you want to keep
    return messages[0];
  };
}

module.exports = {
  create(options) {
    return {
      meta: { name: "check-json-value/json" },
      preprocess: preprocessFactory(options),
      postprocess: postprocessFactory(options),
      supportsAutofix: false,
    };
  },
};
