import { seal } from "../utils/seal";
import { VirtualNode } from "lib/VirtualNode";
import { VirtualNodeList } from "lib/VirtualNodeList";

export class State<T> {
  static boundNode?: VirtualNode;
  static boundNodeProperty?: string;
  static boundNodeCollection?: VirtualNodeList;
  private __boundNodes = new Map<VirtualNode, Set<string>>();
  private __boundNodeCollections = new Set<VirtualNodeList>();
  private __listeners: ((value: T) => void)[] = [];
  protected __internalState: T;

  constructor(initialValue: T) {
    this.__internalState = initialValue;
    seal(this);
  }

  get state() {
    if (State.boundNode && State.boundNodeProperty) {
      const map =
        this.__boundNodes.get(State.boundNode) ||
        this.__boundNodes.set(State.boundNode, new Set()).get(State.boundNode);
      map?.add(State.boundNodeProperty);
    }

    if (State.boundNodeCollection) {
      this.__boundNodeCollections.add(State.boundNodeCollection);
    }

    return this.__internalState;
  }

  set state(newValue: T) {
    this.__updateState(newValue);
  }

  set(updater: (current: T) => T) {
    this.state = updater(this.__internalState);
  }

  addListener(callback: (value: T) => void) {
    this.__listeners.push(callback);
    return this;
  }

  protected __updateState(newValue: T) {
    if (newValue !== this.__internalState) {
      this.__internalState = newValue;
      this.__listeners.forEach((cb) => cb(this.__internalState));

      for (let [node, properties] of this.__boundNodes.entries()) {
        properties.forEach((property) => node.update(property));
      }

      this.__boundNodeCollections.forEach((collection) => collection.update());
    }
  }
}

export function state<S>(initialState: S | (() => S)): State<S>;
export function state<S = undefined>(): State<S | undefined>;
export function state<S>(initialState?: S | (() => S)) {
  return new State(
    initialState instanceof Function ? initialState() : initialState
  );
}
