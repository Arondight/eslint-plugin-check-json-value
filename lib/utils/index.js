/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

function isEmpty(o) {
  let result = false;

  switch (typeof o) {
    case "string": {
      result = "" === o;
      break;
    }
    case "object": {
      result = Array.isArray(o) ? 0 === o.length : 0 === Object.keys(o).length;
      break;
    }
  }

  return result;
}

module.exports.allEmpty = function (...args) {
  for (const o of args) {
    if (!isEmpty(o)) {
      return false;
    }
  }

  return true;
};

module.exports.anyEmpty = function (...args) {
  for (const o of args) {
    if (isEmpty(o)) {
      return true;
    }
  }

  return false;
};

module.exports.noneEmpty = function (...args) {
  for (const o of args) {
    if (isEmpty(o)) {
      return false;
    }
  }

  return true;
};
