import { seal } from "./utils/seal";
import {
  BqNode,
  NodeChildren,
  NodeChildrenCreator,
  NodeCreator,
} from "./BqNode";
import { DomController } from "./DomController";
import { State } from "./State";
import { spliceEach } from "./utils/spliceEach";

export class BqNodeList extends DomController {
  static currentNode?: BqNodeList;

  public children: BqNode[] = [];
  private __parent: BqNode;
  private __childSource: NodeChildren;
  private __shouldUpdateIndices: number[] = [];
  private __shouldAppendIndices: number[] = [];
  private __shouldRemoveIndices: number[] = [];

  constructor(parent: BqNode, children: NodeChildren) {
    super();
    this.__parent = parent;
    this.__childSource = children;
    BqNodeList.currentNode = this;
    this.children = this.__isDynamic(this.__childSource)
      ? this.__childSource().map(this.__createChild.bind(this))
      : this.__childSource.map(this.__createChild.bind(this));
    BqNodeList.currentNode = undefined;
    seal(this);
  }

  renderDom() {
    if (this.__parent.element === undefined) return;
    this.__parent.element?.append(
      ...this.children.reduce((elements, child) => {
        const shouldMount = child.attributes.$if?.() ?? true;
        const element = child.renderDom(shouldMount);
        if (shouldMount) return elements.concat(element);
        return elements;
      }, [] as HTMLElement[])
    );
  }

  updateDom() {
    const parentElement = this.__parent.element;
    if (!parentElement) return;

    this.__queueDomUpdate(() => {
      try {
        // remove

        const removeChildren: Element[] = [];

        spliceEach(this.__shouldRemoveIndices, (n) => {
          removeChildren.push(parentElement.children[n]);
        });

        removeChildren.forEach((child) => child.remove());

        // replace

        spliceEach(this.__shouldUpdateIndices, (n) =>
          parentElement.replaceChild(
            this.children[n].renderDom(),
            parentElement.children[n]
          )
        );

        // append

        spliceEach(this.__shouldAppendIndices, (n) =>
          parentElement.appendChild(this.children[n].renderDom())
        );
      } catch (e) {
        console.log(e);
      }
    });
  }

  onStateChange(_: State<any>) {
    if (!this.__isDynamic(this.__childSource)) return;
    const currentNodes = this.children.slice();
    const newNodes = this.__childSource().map((child) => child());
    const iterations = Math.max(newNodes.length, currentNodes.length);
    const nextChildren: BqNode[] = [];
    let currentNode: BqNode | undefined;
    let newNode: BqNode | undefined;
    let reusableNode: BqNode | undefined;

    for (let i = 0; i < iterations; i++) {
      currentNode = currentNodes[i];
      newNode = newNodes[i];

      if (currentNode?.attributes.$key === newNode?.attributes.$key) {
        nextChildren[i] = currentNode;
        continue;
      }

      if (newNode === undefined && currentNode !== undefined) {
        this.__shouldRemoveIndices.push(i);
        continue;
      }

      if (currentNode === undefined && newNode !== undefined) {
        nextChildren[i] = newNode;
        this.__shouldAppendIndices.push(i);
        continue;
      }

      if (currentNode !== undefined && newNode !== undefined) {
        reusableNode = currentNodes.find(
          (_currentNode) =>
            !!_currentNode.attributes.$key &&
            _currentNode.attributes.$key === newNode!.attributes.$key
        );

        if (reusableNode) {
          nextChildren[i] = reusableNode;
        } else {
          nextChildren[i] = newNode;
          this.__shouldUpdateIndices.push(i);
        }
      }
    }

    this.children = nextChildren;

    this.updateDom();
  }

  private __createChild(creator: NodeCreator): BqNode {
    const node = creator();
    node.parent = this.__parent;
    return node;
  }

  private __isDynamic(children: NodeChildren): children is NodeChildrenCreator {
    return typeof children === "function";
  }
}

export function list() {}
