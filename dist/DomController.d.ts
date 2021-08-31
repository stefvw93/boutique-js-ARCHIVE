export declare abstract class DomController {
    private __updateQueue;
    private __callbackQueue;
    private __requestId?;
    constructor();
    abstract renderDom(): any;
    protected __queueDomUpdate(update: () => void, callback?: () => void): void;
    private __executeDomUpdates;
}
