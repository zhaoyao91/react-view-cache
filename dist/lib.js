'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.deepEqual = deepEqual;
exports.deepAssign = deepAssign;
function deepEqual(a, b) {
  if (!isObject(a) || !isObject(b)) return a === b;else return deepEqualInner(a, b) && deepEqualInner(b, a);
}

function deepEqualInner(a, b) {
  for (var key in a) {
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

function isObject(x) {
  return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' && x !== null;
}

function deepAssign(base, extension) {
  if (!isObject(base)) base = {};
  if (!isObject(extension)) extension = {};

  for (var key in extension) {
    if (!isObject(extension[key])) base[key] = extension[key];else base[key] = deepAssign(base[key], extension[key]);
  }

  return base;
}