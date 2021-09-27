import { State } from "./reactivity/State";
import { getDynamicValue } from "./utils";
import { VirtualNodeCollection } from "./VirtualNodeCollection";

export type ChildType = Primitive | VirtualNode;
export type Children = Array<ChildType | Dynamic<ChildType | ChildType[]>>;

export class VirtualNode {
  private readonly __properties: Record<string, any>;
  private readonly __state: Record<string, any> = {};
  private readonly __children: VirtualNodeCollection;

  get properties() {
    return { ...this.__properties };
  }

  get children() {
    return this.__children.nodes;
  }

  get html(): string {
    return [
      [
        `<${this.tag}`,
        Object.entries(this.properties)
          .filter(([key]) => !key.startsWith("$"))
          .reduce(
            (acc, [key, value]) => (
              (acc += ` ${this.__getHtmlAttributeName(key)}="${getDynamicValue(
                value
              )}"`),
              acc
            ),
            ""
          ),
        `>`,
      ].join(""),

      this.children
        .map((child) => (child instanceof VirtualNode ? child.html : child))
        .join(""),

      `</${this.tag}>`,
    ].join("");
  }

  constructor(
    readonly tag: string,
    properties: Record<string, Dynamic<any>> = {},
    children: Children = []
  ) {
    this.__children = new VirtualNodeCollection(children);
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

  private __getHtmlAttributeName(name: string) {
    switch (name) {
      case "className":
        return "class";
    }

    return name
      .split(/(?=[A-Z])/)
      .map((str) => str.toLowerCase())
      .join("-");
  }
}
