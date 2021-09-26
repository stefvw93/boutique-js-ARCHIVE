type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type Dynamic<T> = T | (() => T);
