export function getDynamicValue<T>(
  dynamic: Dynamic<T>,
  callback?: (isDynamic: boolean, value: T) => void
): T {
  const isDynamic = isFunction(dynamic);
  const value = isDynamic ? dynamic() : dynamic;
  callback?.(isDynamic, value);
  return value;
}

export function isFunction(input: unknown): input is Function {
  return typeof input === "function";
}

export function isPrimitive(input: any): input is Primitive {
  return [
    "string",
    "number",
    "boolean",
    "bigint",
    "symbol",
    "undefined",
    "null",
  ].includes(typeof input);
}

export function seal<T extends Object>(obj: T) {
  Object.entries(obj).forEach(([key, value]) => {
    const isPublic = !key.startsWith("__");
    const isMethod = obj[key as keyof T] instanceof Function;
    Object.defineProperty(obj, key, {
      value,
      enumerable: isPublic,
      configurable: isPublic,
      writable: !isMethod,
    });
  });
}

export function spliceEach<T>(array: T[], callback: (element: T) => any) {
  while (array.length > 0) {
    callback(array[0]);
    array.splice(0, 1);
  }
}
