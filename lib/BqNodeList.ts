import { seal } from "~/lib/utils/seal";
import { BqNode, NodeChildren, NodeChildrenCreator } from "./BqNode";
import { DomController } from "./DomController";
import { State } from "./State";

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
      ? this.__childSource().map((child) => child())
      : this.__childSource.map((child) => child());
    BqNodeList.currentNode = undefined;
    seal(this);
  }

  renderDom() {
    if (this.__parent.element === undefined) return;
    this.__parent.element?.append(
      ...this.children.map((child) => child.renderDom())
    );
  }

  updateDom() {
    const parentElement = this.__parent.element;

    if (!parentElement) return;

    this.__queueDomUpdate(() => {
      while (this.__shouldRemoveIndices.length > 0) {
        parentElement.children[this.__shouldRemoveIndices[0]].remove();
        this.__shouldRemoveIndices.splice(0, 1);
      }

      while (this.__shouldUpdateIndices.length > 0) {
        parentElement.replaceChild(
          this.children[this.__shouldUpdateIndices[0]].renderDom(),
          parentElement.children[this.__shouldUpdateIndices[0]]
        );
        this.__shouldUpdateIndices.splice(0, 1);
      }

      while (this.__shouldAppendIndices.length > 0) {
        parentElement.appendChild(
          this.children[this.__shouldAppendIndices[0]].renderDom()
        );
        this.__shouldAppendIndices.splice(0, 1);
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

  private __isDynamic(children: NodeChildren): children is NodeChildrenCreator {
    return typeof children === "function";
  }
}

export function list() {}
