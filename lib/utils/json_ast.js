/**
 * @fileoverview ESLint plugin to check value of JSON file
 * @author Qin Fandong
 */
"use strict";

const { JsonNodeTypes } = require("@anchan828/json-ast");

module.exports.visit = function visit(node, ...path) {
  const valueTypes = [
    JsonNodeTypes.VALUE,
    JsonNodeTypes.STRING,
    JsonNodeTypes.KEY,
    JsonNodeTypes.NUMBER,
    JsonNodeTypes.TRUE,
    JsonNodeTypes.FALSE,
    JsonNodeTypes.NULL,
  ];

  if (undefined === node) {
    return undefined;
  }

  const isValueType = valueTypes.includes(node.type);

  if (true === isValueType || (0 === path.length && false === isValueType)) {
    return node;
  }

  if (JsonNodeTypes.DOCUMENT === node.type) {
    return visit(node.child, ...path);
  }

  if (JsonNodeTypes.OBJECT === node.type) {
    const prop = path.shift();
    return visit(node.properties.filter((o) => prop === o?.key?.value)[0]?.value, ...path);
  }

  if (JsonNodeTypes.ARRAY === node.type) {
    const prop = path.shift();
    return visit(node.items[prop], ...path);
  }
};
