import { BqNode, NodeChildren } from "./BqNode";
import { DomController } from "./DomController";
import { State } from "./State";
export declare class BqNodeList extends DomController {
    static currentNode?: BqNodeList;
    children: BqNode[];
    private __parent;
    private __childSource;
    private __shouldUpdateIndices;
    private __shouldAppendIndices;
    private __shouldRemoveIndices;
    constructor(parent: BqNode, children: NodeChildren);
    renderDom(): void;
    updateDom(): void;
    onStateChange(_: State<any>): void;
    private __isDynamic;
}
export declare function list(): void;
