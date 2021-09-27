import { State } from "./reactivity/State";
import { getDynamicValue, isPrimitive } from "./utils";
import { ChildType, VirtualNode } from "./VirtualNode";

export class VirtualNodeList {
  private readonly __nodes: ChildType[];
  private readonly __children: Dynamic<ChildType[]>;
  private readonly __virtualNodes = new Map<number, VirtualNode>();
  private readonly __nodeKeyLookup = new Map<any, VirtualNode>();
  private readonly __primitives = new Map<number, Primitive>();

  get nodes(): ChildType[] {
    return this.__nodes;
  }

  constructor(children: Dynamic<ChildType[]>) {
    this.__children = children;
    State.boundNodeList = this;
    this.__nodes = getDynamicValue(children);
    State.boundNodeList = undefined;
  }

  update() {}
}
