/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

module.exports.isEmpty = function (o) {
  let isEmpty;

  switch (typeof o) {
    case "string": {
      isEmpty = "" === o;
      break;
    }
    case "object": {
      isEmpty = Array.isArray(o) ? 0 === o.length : 0 === Object.keys(o).length;
      break;
    }
  }

  return !!isEmpty;
};
