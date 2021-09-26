import { State } from "./reactivity/State";
import { getDynamicValue, isFunction } from "./utils";
import { VirtualNodeList } from "./VirtualNodeList";

export type ChildType = Primitive | VirtualNode;
export type Children = Array<ChildType | ChildType[] | (() => ChildType[])>;

export class VirtualNode {
  private readonly __properties: Record<string, any>;
  private readonly __state: Record<string, any> = {};
  private readonly __children: any;

  get properties() {
    return { ...this.__properties };
  }

  constructor(
    readonly tag: string,
    properties: Record<string, Dynamic<any>> = {},
    children: Children = []
  ) {
    this.__children = children.map((child) =>
      Array.isArray(child) || isFunction(child)
        ? new VirtualNodeList(child)
        : child
    );
    this.__properties = properties;
    this.__setInitialState();
  }

  update(property: string) {
    console.log("update", this.tag, property);
  }

  private __setInitialState() {
    State.boundNode = this;

    Object.keys(this.__properties).forEach((key) => {
      State.boundNodeProperty = key;
      this.__state[key] = getDynamicValue(this.__properties[key]);
    });

    State.boundNode = undefined;
    State.boundNodeProperty = undefined;
  }
}
