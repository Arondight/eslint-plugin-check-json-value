/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const jsonService = require("vscode-json-languageservice");
const { parse } = require("@anchan828/json-ast");
const { createScanner, SyntaxKind } = require("jsonc-parser");

const jsonServiceHandle = jsonService.getLanguageService({});

function preprocessFactory(options) {
  // takes text of the file and filename
  return function (text, filename) {
    // here, you can strip out any non-JS content
    // and split into multiple strings to lint
    const textDocument = jsonService.TextDocument.create(filename, "json", 1, text);
    const option = {
      file: filename,
      document: jsonServiceHandle.parseJSONDocument(textDocument),
    };

    try {
      option.documentVerbose = parse(text, { verbose: true, junker: false });
    } catch {
      // parse failure leaves documentVerbose undefined; the json-lint rule
      // separately reports syntax errors, so silent catch is intentional.
    }

    // Strict JSON mode: .json files flag comments; .jsonc files allow them.
    // The parser is JSONC-tolerant (silently accepts // and /* */), so we scan
    // separately with jsonc-parser's scanner to detect comments in strict files.
    if (!filename.endsWith(".jsonc")) {
      const scanner = createScanner(text);
      const commentErrors = [];
      let token;
      while ((token = scanner.scan()) !== SyntaxKind.EOF) {
        if (token === SyntaxKind.LineCommentTrivia || token === SyntaxKind.BlockCommentTrivia) {
          const offset = scanner.getTokenOffset();
          const endOffset = offset + scanner.getTokenLength();
          commentErrors.push({
            message: "Comments are not allowed in strict JSON (rename to .jsonc or set strict: false)",
            range: {
              start: textDocument.positionAt(offset),
              end: textDocument.positionAt(endOffset),
            },
          });
        }
      }
      option.commentErrors = commentErrors;
    } else {
      option.commentErrors = [];
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
