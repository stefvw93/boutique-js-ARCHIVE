import { Dictionary } from "ts-essentials";
import { seal } from "./utils/seal";
import { BqNodeList } from "./BqNodeList";
import { DomController } from "./DomController";
import { State } from "./State";

export type NodeCreator = () => BqNode;
export type NodeChildrenCreator = () => NodeCreator[];
export type NodeChildren = NodeCreator[] | NodeChildrenCreator;
export type AttributeType = string | number | boolean | null | undefined;
export type AttributeGetter = () => AttributeType;
export type AttributeValue = AttributeType | AttributeGetter;
export type LifecycleCallback = (element?: HTMLElement) => any;

// type Attributes = {
//   $if?(): boolean;
//   $text: AttributeValue;
//   $html: AttributeValue;
//   $onAppend?(): any;
//   $onRemove?(): any;
//   $onUpdate?(): any;
// };

export class BqNode extends DomController {
  static currentNode?: BqNode;

  static create(
    tag: string,
    attributes: Dictionary<any> = {},
    children?: NodeChildren
  ) {
    return () => new BqNode(tag, attributes, children);
  }

  parent?: BqNode;
  element?: HTMLElement;
  isFirstRender = true;
  private __attributeState: Dictionary<any> = { $if: true };
  private __changedStates: State<unknown>[] = [];
  private __changedAttributes: string[] = [];
  private __childNodeList?: BqNodeList;
  private __doSetStaticAttributes = true;
  private __dynamicAttributes: string[] = [];
  private __doRenderDom = false;
  private __mountingElement?: HTMLElement;

  constructor(
    public tag: string,
    public attributes: Dictionary<any>,
    children?: NodeChildren
  ) {
    super();
    if (children) this.__childNodeList = new BqNodeList(this, children);
    this.__setAttributeState();
    seal(this);
  }

  get html(): string {
    return [
      `<${this.tag}`,
      Object.entries(this.__attributeState).reduce(
        (accumulator, [key, value]) => {
          if ([key.startsWith("$"), this.__isEventName(key)].includes(true)) {
            return accumulator;
          }
          return (
            accumulator + ` ${this.__getHtmlAttributeName(key)}="${value}"`
          );
        },
        ""
      ),
      `>`,
      this.__attributeState.$text ??
        this.__childNodeList?.children.map((child) => child.html).join("") ??
        "",
      `</${this.tag}>`,
    ].join("");
  }

  private get __parentElement() {
    return this.parent?.element ?? this.__mountingElement;
  }

  private get __shouldRemove() {
    return (
      this.__changedAttributes.includes("$if") &&
      this.__attributeState.$if === false
    );
  }

  private get __shouldAppend() {
    return (
      this.__changedAttributes.includes("$if") &&
      this.__attributeState.$if === true
    );
  }

  private get __onAppend(): LifecycleCallback | undefined {
    return this.__attributeState.$onAppend;
  }

  private get __onUpdate(): LifecycleCallback | undefined {
    return this.__attributeState.$onUpdate;
  }

  private get __onRemove(): LifecycleCallback | undefined {
    return this.__attributeState.$onRemove;
  }

  mount(element: HTMLElement) {
    this.__mountingElement = element;
    element.innerHTML = "";
    element.appendChild(this.renderDom(true));
  }

  renderDom(willMount = false) {
    if (!this.isFirstRender) throw new Error("Use update method instead.");
    this.__doRenderDom = true;
    this.__setAttributeState();
    this.element = document.createElement(this.tag);
    this.__setElementAttributes();
    this.__childNodeList?.renderDom();
    this.isFirstRender = false;

    if (willMount) {
      this.__queueDomUpdate(undefined, () => this.__onAppend?.(this.element));
    }

    return this.element;
  }

  updateDom() {
    if (!this.__doRenderDom) return;

    this.__queueDomUpdate(
      this.__setElementAttributes.bind(this),
      this.__onUpdate?.(this.element)
    );

    if (this.__shouldAppend != this.__shouldRemove) {
      this.__queueDomUpdate(
        () => {
          if (!this.element) return;
          if (this.__shouldAppend) {
            this.__parentElement?.appendChild(this.element);
          }
          if (this.__shouldRemove) {
            this.__parentElement?.removeChild(this.element);
          }
        },
        this.__shouldAppend
          ? () => this.__onAppend?.(this.element)
          : () => this.__onRemove?.(this.element)
      );
    }
  }

  onStateChange(state: State<unknown>) {
    this.__changedStates.push(state);
    this.__setAttributeState();
    this.updateDom();
  }

  private __setElementAttributes() {
    if (!this.element) return;

    const keys = this.isFirstRender
      ? Object.keys(this.__attributeState)
      : this.__changedAttributes;

    keys.forEach((key) => {
      const value = this.__attributeState[key];

      if (key === "$html") {
        this.element!.innerHTML = value != undefined ? String(value) : "";
        return;
      }

      if (key === "$text") {
        this.element!.innerText = value != undefined ? String(value) : "";
        return;
      }

      if (this.__isEventName(key)) {
        (this.element! as any)[this.__getHtmlAttributeName(key)] = value;
        return;
      }

      if (key[0] === "$") return;

      this.element!.setAttribute(this.__getHtmlAttributeName(key), value);
    });
  }

  private __setAttributeState() {
    let newValue: any;
    let isDynamic: boolean;

    BqNode.currentNode = this;
    this.__changedAttributes.splice(0, this.__changedAttributes.length);

    if (this.__doSetStaticAttributes) {
      Object.entries(this.attributes).forEach(([key, value]) => {
        isDynamic = this.__isDynamicAttribute(key, value);
        newValue = isDynamic ? value() : value;
        this.__handleNewAttributeValue(key, newValue);
      });
    } else {
      this.__dynamicAttributes.forEach((key) => {
        newValue = this.attributes[key]();
        this.__handleNewAttributeValue(key, newValue);
      });
    }

    BqNode.currentNode = undefined;
    this.__doSetStaticAttributes = false;
  }

  private __handleNewAttributeValue(key: string, newValue: any) {
    if (newValue !== this.__attributeState[key]) {
      this.__changedAttributes.push(key);
      this.__attributeState[key] = newValue;
    }
  }

  private __isDynamicAttribute(
    key: string,
    value: AttributeValue
  ): value is AttributeGetter {
    if (
      !key.startsWith("$on") &&
      (key === "$if" ||
        (!this.__isEventName(key) && typeof value === "function"))
    ) {
      this.__dynamicAttributes.push(key);
      return true;
    }

    return false;
  }

  private __getHtmlAttributeName(name: string) {
    if (this.__isEventName(name)) {
      return name.toLowerCase();
    }

    switch (name) {
      case "className":
        return "class";
    }

    return name
      .split(/(?=[A-Z])/)
      .map((str) => str.toLowerCase())
      .join("-");
  }

  private __isEventName(name: string) {
    return (
      name.startsWith("on") && name.charAt(2) === name.charAt(2).toUpperCase()
    );
  }
}
