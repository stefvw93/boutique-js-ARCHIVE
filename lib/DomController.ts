import { seal } from "./utils/seal";
import { spliceEach } from "./utils/spliceEach";

export abstract class DomController {
  private __updateQueue: (() => void)[] = [];
  private __callbackQueue: (() => void)[] = [];
  private __requestId?: number;

  constructor() {
    seal(this);
  }

  abstract renderDom(): any;

  protected __queueDomUpdate(update?: () => void, callback?: () => void) {
    if (this.__requestId) cancelAnimationFrame(this.__requestId);
    if (callback) this.__callbackQueue.push(callback);
    if (update) this.__updateQueue.push(update);
    this.__requestId = requestAnimationFrame(this.__executeDomUpdates);
  }

  private __executeDomUpdates = () => {
    spliceEach(this.__updateQueue, (update) => update());
    spliceEach(this.__callbackQueue, (callback) => callback());
  };
}
