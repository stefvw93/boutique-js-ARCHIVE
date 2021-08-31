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
