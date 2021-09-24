export declare const readStatePool: State<any>[];
export declare class State<T> {
    private __boundNodes;
    private __listeners;
    protected __trackReadCalls: boolean;
    protected __internalState: T;
    constructor(initialValue: T);
    get state(): T;
    set state(newValue: T);
    set(updater: (current: T) => T): void;
    addListener(callback: (value: T) => void): this;
    protected __updateState(newValue: T): void;
}
export declare function state<S>(initialState: S | (() => S)): State<S>;
export declare function state<S = undefined>(): State<S | undefined>;
