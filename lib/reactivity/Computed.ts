import { State, readStatePool } from "./State";
import { seal } from "../utils/seal";
import { spliceEach } from "../utils/spliceEach";

type ComputedConfig<T> = {
  getter(): T;
  setter?(value: T): void;
};

export class Computed<T> extends State<T> {
  private __config: ComputedConfig<T>;

  constructor(config: ComputedConfig<T>) {
    super(undefined as unknown as T);
    this.__config = config;
    this.__internalState = config.getter();
    spliceEach(readStatePool, this.__handleTrackedStateUpdate.bind(this));
    seal(this);
  }

  private __handleTrackedStateUpdate(state: State<any>) {
    state.addListener(() => this.__updateState(this.__config.getter()));
  }

  set state(newValue: T) {
    if (!this.__config.setter) {
      throw new Error("Cannot update read-only state.");
    }

    this.__config.setter(newValue);
  }
}

export function computed<T>(getter: () => T): Computed<T>;
export function computed<T>(config: ComputedConfig<T>): Computed<T>;
export function computed<T>(getterOrConfig: (() => T) | ComputedConfig<T>) {
  return new Computed(
    getterOrConfig instanceof Function
      ? { getter: getterOrConfig }
      : getterOrConfig
  );
}
