import { BqNode, NodeChildren } from "./BqNode";
declare type ElementCreator = (attributes?: Record<string, any>, children?: NodeChildren) => () => BqNode;
export declare const div: ElementCreator;
export declare const h1: ElementCreator;
export {};
