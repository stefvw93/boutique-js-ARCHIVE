import { seal } from "../utils/seal";

export abstract class DomController {
  private __updateQueue: (() => void)[] = [];
  private __callbackQueue: (() => void)[] = [];
  private __requestId?: number;

  constructor() {
    seal(this);
  }

  abstract renderDom(): any;

  protected __queueDomUpdate(update: () => void, callback?: () => void) {
    if (this.__requestId) cancelAnimationFrame(this.__requestId);
    if (callback) this.__callbackQueue.push(callback);
    this.__updateQueue.push(update);
    this.__requestId = requestAnimationFrame(this.__executeDomUpdates);
  }

  private __executeDomUpdates = () => {
    while (this.__updateQueue.length > 0) {
      this.__updateQueue[0]();
      this.__updateQueue.splice(0, 1);
    }

    while (this.__callbackQueue.length > 0) {
      this.__callbackQueue[0]();
      this.__callbackQueue.splice(0, 1);
    }
  };
}
