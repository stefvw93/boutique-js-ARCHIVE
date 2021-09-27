import { State } from "./reactivity/State";
import { getDynamicValue } from "./utils";
import { Children, ChildType } from "./VirtualNode";
import { VirtualNodeList } from "./VirtualNodeList";

export class VirtualNodeCollection {
  private readonly __nodes: Array<ChildType | VirtualNodeList>;

  constructor(children: Children) {
    this.__nodes = children.map((element) => {
      if (typeof element === "function" || Array.isArray(element)) {
        return new VirtualNodeList(element);
      }

      return element;
    });
  }

  update() {}
}
