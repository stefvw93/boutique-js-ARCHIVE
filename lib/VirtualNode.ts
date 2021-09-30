import { State } from "./reactivity/State";
import { getDynamicValue } from "./utils";
import { VirtualNodeCollection } from "./VirtualNodeCollection";

export type ChildType = Primitive | VirtualNode;
export type VirtualNodeChildren = Array<
  Dynamic<ChildType | Primitive | ChildType[]>
>;

export class VirtualNode {
  private readonly __properties: Record<string, any>;
  private readonly __state: Record<string, any> = {};
  private readonly __children: VirtualNodeCollection;

  get properties() {
    return { ...this.__state };
  }

  // get html(): string {
  //   return [
  //     [
  //       `<${this.tag}`,
  //       Object.entries(this.properties)
  //         .filter(([key]) => !key.startsWith("$"))
  //         .reduce(
  //           (acc, [key, value]) => (
  //             (acc += ` ${this.__getHtmlAttributeName(key)}="${getDynamicValue(
  //               value
  //             )}"`),
  //             acc
  //           ),
  //           ""
  //         ),
  //       `>`,
  //     ].join(""),

  //     this.children
  //       .map((child) => (child instanceof VirtualNode ? child.html : child))
  //       .join(""),

  //     `</${this.tag}>`,
  //   ].join("");
  // }

  constructor(
    readonly tag: string,
    properties: Record<string, Dynamic<any>> = {},
    children: VirtualNodeChildren = []
  ) {
    this.__properties = properties;
    this.__createState();
    this.__children = new VirtualNodeCollection(children);
  }

  update(property: string) {
    this.__state[property] = this.__properties[property]();
  }

  private __createState() {
    State.boundNode = this;

    Object.keys(this.__properties).forEach((key) => {
      State.boundNodeProperty = key;
      this.__state[key] = getDynamicValue(this.__properties[key]);
    });

    State.boundNode = undefined;
    State.boundNodeProperty = undefined;
  }

  private __getHtmlAttributeName(name: string) {
    // maybe for JSX syntax in the future
    switch (name) {
      case "htmlClass":
        return "class";
      case "htmlFor":
        return "for";
    }

    return name
      .split(/(?=[A-Z])/)
      .map((str) => str.toLowerCase())
      .join("-");
  }
}
