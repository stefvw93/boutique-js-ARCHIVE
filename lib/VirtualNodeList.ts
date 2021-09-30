import { State } from "./reactivity/State";
import { getDynamicValue, isPrimitive } from "./utils";
import { ChildType, VirtualNode } from "./VirtualNode";

export class VirtualNodeList extends Array<ChildType> {
  private readonly __virtualNodes = new Map<number, VirtualNode>();
  private readonly __nodeKeyLookup = new Map<any, VirtualNode>();
  private readonly __primitives = new Map<number, Primitive>();

  constructor(children: ChildType[]) {
    super(children.length);
    children.forEach((child, index) => (this[index] = child));
  }

  update(newChildren: ChildType[]) {
    console.log("update list", newChildren);
  }
}
