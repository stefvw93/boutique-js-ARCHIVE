import { seal } from "./utils/seal";
import { effectStack } from "./BqNode";
import { State } from "./State";

export class Effect {
  static isEffect(arg: any) {
    return arg.constructor?.name === "Effect";
  }

  private __callback: () => (() => void) | undefined;
  private __cleanup?: () => any;
  private __watch?: State<any>[];

  constructor(callback: () => any, watch?: State<any>[]) {
    this.__callback = callback;
    this.__watch = watch;
    seal(this);
  }

  dispatch(origin?: State<any>) {
    if (!origin || !this.__watch || this.__watch.includes(origin)) {
      this.__cleanup = this.__callback();
    }
  }

  cleanup() {
    this.__cleanup?.();
  }
}

export function effect(watch: State<any>[], callback: () => any): void;
export function effect(callback: () => any): void;
export function effect(
  callbackOrWatch: (() => any) | State<any>[],
  callback?: () => any
) {
  if (typeof callbackOrWatch === "function") {
    effectStack.push(new Effect(callbackOrWatch));
  } else if (callback) {
    effectStack.push(new Effect(callback, callbackOrWatch));
  }
}
