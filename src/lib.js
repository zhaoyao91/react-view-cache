export function deepEqual(a, b) {
  if (!isObject(a) || !isObject(b)) return a === b;
  else return deepEqualInner(a, b) && deepEqualInner(b, a);
}

function deepEqualInner(a, b) {
  for (let key in a) {
    if (!deepEqual(a[ key ], b[ key ])) return false;
  }
  return true;
}

function isObject(x) {
  return typeof x === 'object' && x !== null;
}

export function deepAssign(base, extension) {
  if (!isObject(base)) base = {};
  if (!isObject(extension)) extension = {};

  for (let key in extension) {
    if (!isObject(extension[ key ])) base[ key ] = extension[ key ];
    else base[ key ] = deepAssign(base[ key ], extension[ key ]);
  }

  return base;
}