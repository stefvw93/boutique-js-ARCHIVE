import { Dictionary } from "ts-essentials";
import { seal } from "./utils/seal";
import { BqNodeList } from "./BqNodeList";
import { DomController } from "./DomController";
import { Effect } from "./Effect";
import { State } from "./State";
import { spliceEach } from "./utils/spliceEach";

export type NodeCreator = () => BqNode;
export type NodeChildrenCreator = () => NodeCreator[];
export type NodeChildren = NodeCreator[] | NodeChildrenCreator;
export type AttributeType = string | number | boolean | null | undefined;
export type AttributeGetter = () => AttributeType;
export type AttributeValue = AttributeType | AttributeGetter;

// type Attributes = {
//   $if?(): boolean;
//   $text: AttributeValue;
//   $html: AttributeValue;
// };

export const effectStack: Effect[] = [];

export class BqNode extends DomController {
  static currentNode?: BqNode;

  static create(
    tag: string,
    attributes: Dictionary<any> = {},
    children?: NodeChildren
  ) {
    const _effectStack = effectStack.slice();
    const creator = () => new BqNode(tag, attributes, children, _effectStack);
    effectStack.splice(0, effectStack.length);
    return creator;
  }

  parent?: BqNode;
  element?: HTMLElement;
  isFirstRender = true;
  private __attributeState: Dictionary<any> = { $if: true };
  private __changedStates: State<unknown>[] = [];
  private __boundEffects: Effect[];
  private __changedAttributes: string[] = [];
  private __childNodeList?: BqNodeList;
  private __doSetStaticAttributes = true;
  private __dynamicAttributes: string[] = [];
  private __doRenderDom = false;
  private __mountingElement?: HTMLElement;

  constructor(
    public tag: string,
    public attributes: Dictionary<any>,
    children?: NodeChildren,
    boundEffects: Effect[] = []
  ) {
    super();
    this.__boundEffects = boundEffects;
    if (children) this.__childNodeList = new BqNodeList(this, children);
    this.__setAttributeState();
    seal(this);
  }

  get html(): string {
    return [
      `<${this.tag}`,
      Object.entries(this.__attributeState).reduce(
        (accumulator, [key, value]) => {
          if ([key.startsWith("$"), key.startsWith("on")].includes(true)) {
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
      this.__queueDomUpdate(() => {
        this.__boundEffects.forEach((effect) => effect.dispatch());
      });
    }

    return this.element;
  }

  updateDom() {
    if (!this.__doRenderDom) return;

    this.__queueDomUpdate(this.__setElementAttributes.bind(this), () => {
      spliceEach(this.__changedStates, (state) => {
        this.__boundEffects.forEach((effect) => {
          effect.dispatch(state);
        });
      });
    });

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
          ? () => this.__boundEffects.forEach((effect) => effect.dispatch())
          : () => this.__boundEffects.forEach((effect) => effect.cleanup())
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

      if (key.substr(0, 2) === "on") {
        this.element![key as "onclick"] = value;
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

        if (isDynamic) {
          this.__dynamicAttributes.push(key);
          newValue = value();
        } else {
          newValue = value;
        }

        if (newValue !== this.__attributeState[key]) {
          this.__changedAttributes.push(key);
          this.__attributeState[key] = newValue;
        }
      });
    } else {
      this.__dynamicAttributes.forEach((key) => {
        newValue = this.attributes[key]();

        if (newValue !== this.__attributeState[key]) {
          this.__changedAttributes.push(key);
          this.__attributeState[key] = newValue;
        }
      });
    }

    BqNode.currentNode = undefined;
    this.__doSetStaticAttributes = false;
  }

  private __isDynamicAttribute(
    key: string,
    value: AttributeValue
  ): value is AttributeGetter {
    return (
      key === "$if" ||
      (key.substr(0, 2) !== "on" && typeof value === "function")
    );
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
