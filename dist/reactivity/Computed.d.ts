import { State } from "./State";
declare type ComputedConfig<T> = {
    getter(): T;
    setter?(value: T): void;
};
export declare class Computed<T> extends State<T> {
    private __config;
    constructor(config: ComputedConfig<T>);
    private __handleTrackedStateUpdate;
    set state(newValue: T);
}
export declare function computed<T>(getter: () => T): Computed<T>;
export declare function computed<T>(config: ComputedConfig<T>): Computed<T>;
export {};
