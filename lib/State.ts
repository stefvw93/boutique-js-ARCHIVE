import { seal } from "./utils/seal";
import { BqNode } from "./BqNode";
import { BqNodeList } from "./BqNodeList";

export class State<T> {
  private __boundNodes: (BqNodeList | BqNode)[] = [];
  private __internalState: T;
  private __listeners: ((value: T) => void)[] = [];

  constructor(initialValue: T) {
    this.__internalState = initialValue;
    seal(this);
  }

  get state() {
    const boundNodes = this.__boundNodes;
    const currentNode = BqNode.currentNode;
    const currentNodeList = BqNodeList.currentNode;

    if (currentNode && !boundNodes.includes(currentNode)) {
      boundNodes.push(currentNode);
    }

    if (currentNodeList && !boundNodes.includes(currentNodeList)) {
      boundNodes.push(currentNodeList);
    }

    return this.__internalState;
  }

  set state(newValue: T) {
    if (newValue !== this.__internalState) {
      this.__internalState = newValue;
      this.__listeners.forEach((cb) => cb(this.__internalState));
      this.__boundNodes.forEach((node) => node.onStateChange(this));
    }
  }

  set(updater: (current: T) => T) {
    this.state = updater(this.__internalState);
  }

  addListener(callback: (value: T) => void) {
    this.__listeners.push(callback);
    return this;
  }
}

export function state<S>(initialState: S | (() => S)): State<S>;
export function state<S = undefined>(): State<S | undefined>;
export function state<S>(initialState?: S | (() => S)) {
  return new State(
    initialState instanceof Function ? initialState() : initialState
  );
}
