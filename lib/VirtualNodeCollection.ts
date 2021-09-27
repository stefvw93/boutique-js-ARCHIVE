import { State } from "./reactivity/State";
import { getDynamicValue } from "./utils";
import { Children, ChildType } from "./VirtualNode";
import { VirtualNodeList } from "./VirtualNodeList";

export class VirtualNodeCollection {
  private readonly __children: Children;
  private readonly __nodes: Array<ChildType | VirtualNodeList>;

  constructor(children: Children) {
    this.__children = children;
    this.__nodes = children.map((element) => {
      return getDynamicValue(element, (isDynamic, value) => {
        if ((isDynamic && Array.isArray(value)) || Array.isArray(element)) {
          return new VirtualNodeList(element as Dynamic<ChildType[]>);
        }

        if (isDynamic) {
          State.boundNodeCollection = this;
          (State.boundDynamicNode = element as () => ChildType)();
          return element;
        }

        return value;
      });
    }) as Array<ChildType | VirtualNodeList>;
  }

  update(dynamicNode: () => ChildType) {
    console.log(
      "update collection",
      this.__children.indexOf(dynamicNode),
      dynamicNode
    );
  }
}
