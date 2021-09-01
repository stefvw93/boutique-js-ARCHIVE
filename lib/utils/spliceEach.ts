export function spliceEach<T>(array: T[], callback: (element: T) => any) {
  while (array.length > 0) {
    callback(array[0]);
    array.splice(0, 1);
  }
}
