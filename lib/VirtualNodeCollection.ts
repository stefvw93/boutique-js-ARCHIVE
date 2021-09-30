import { State } from "./reactivity/State";
import { getDynamicValue, isFunction, isPrimitive } from "./utils";
import { VirtualNodeChildren, ChildType, VirtualNode } from "./VirtualNode";
import { VirtualNodeList } from "./VirtualNodeList";

export class VirtualNodeCollection extends Array<ChildType | VirtualNodeList> {
  private readonly __children: VirtualNodeChildren;

  constructor(children: VirtualNodeChildren) {
    super(children.length);
    this.__children = children;

    children.forEach((element, index) => {
      let value: ChildType | ChildType[];

      if (isFunction(element)) {
        State.boundNodeCollection = this;
        State.boundDynamicNode = element;
        value = element();
      } else {
        value = element;
      }

      if (Array.isArray(value)) {
        this[index] = new VirtualNodeList(value);
      } else {
        this[index] = value;
      }
    });

    State.boundNodeCollection = undefined;
    State.boundDynamicNode = undefined;
  }

  update(dynamicNode: () => ChildType | ChildType[]) {
    const nodeIndex = this.__children.indexOf(dynamicNode);
    const newNode = dynamicNode();
    const currentNode = this[nodeIndex];
    let shouldUpdate = false;

    // for primitive nodes, do a value comparison
    if (isPrimitive(newNode) && newNode !== currentNode) {
      this[nodeIndex] = newNode;
      shouldUpdate = true;
    }

    // for virtual nodes, compare type, tag & $key property
    else if (newNode instanceof VirtualNode) {
      if (currentNode instanceof VirtualNode) {
        if (
          newNode.tag !== currentNode.tag ||
          newNode.properties.$key !== currentNode.properties.$key
        ) {
          this[nodeIndex] = newNode;
          shouldUpdate = true;
        }
      } else {
        this[nodeIndex] = newNode;
        shouldUpdate = true;
      }
    }

    // for list nodes ?
    else if (Array.isArray(newNode)) {
      if (currentNode instanceof VirtualNodeList) {
        currentNode.update(newNode);
        shouldUpdate = true;
      } else {
        this[nodeIndex] = new VirtualNodeList(newNode);
        shouldUpdate = true;
      }
    }

    console.log({ shouldUpdate });

    if (!shouldUpdate) return;
  }
}
