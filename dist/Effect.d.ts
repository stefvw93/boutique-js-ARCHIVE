import { State } from "./State";
export declare class Effect {
    static isEffect(arg: any): boolean;
    private __callback;
    private __cleanup?;
    private __watch?;
    constructor(callback: () => any, watch?: State<any>[]);
    dispatch(origin?: State<any>): void;
    cleanup(): void;
}
export declare function effect(watch: State<any>[], callback: () => any): void;
export declare function effect(callback: () => any): void;
