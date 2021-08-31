export declare class State<T> {
    private __boundNodes;
    private __internalState;
    private __listeners;
    constructor(initialValue: T);
    get state(): T;
    set state(newValue: T);
    set(updater: (current: T) => T): void;
    addListener(callback: (origin: this) => void): this;
}
export declare function state<S>(initialState: S | (() => S)): State<S>;
export declare function state<S = undefined>(): State<S | undefined>;
