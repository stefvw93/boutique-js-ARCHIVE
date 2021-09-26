import { State } from "./reactivity/State";
import { getDynamicValue, isPrimitive } from "./utils";
import { ChildType, VirtualNode } from "./VirtualNode";

export class VirtualNodeList {
  private __nodes: ChildType[];
  private readonly __children: Dynamic<ChildType[]>;
  private readonly __virtualNodes = new Map<number, VirtualNode>();
  private readonly __nodeKeyLookup = new Map<any, VirtualNode>();
  private readonly __primitives = new Map<number, Primitive>();

  // get nodes(): Array<Child> {
  //   return this.__nodes;
  // }

  constructor(children: Dynamic<ChildType[]>) {
    this.__children = children;
    State.boundNodeCollection = this;
    this.__nodes = getDynamicValue(children);
    this.__nodes.forEach((node, index) => {
      if (isPrimitive(node)) {
        this.__primitives.set(index, node);
      } else {
        const key = node.properties.$key;
        this.__virtualNodes.set(index, node);
        if (key != undefined) this.__nodeKeyLookup.set(key, node);
        else console.error(`Pls gib $key`);
      }
    });
    State.boundNodeCollection = undefined;
  }

  update() {
    const newNodes = getDynamicValue(this.__children);
    // const nextNodes = [] as Array<Child>;
    // const iterations = Math.max(newNodes.length, this.nodes.length);
    // let newNode: Child;
    // let currentNode: Child;
    // for (let i = 0; i < iterations; i++) {
    //   newNode = newNodes[i];
    //   currentNode = this.nodes[i];
    // }
  }
}
