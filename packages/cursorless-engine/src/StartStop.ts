import { Disposable } from "@cursorless/common";

export class StartStop<T extends any[]> {
  private item: Disposable | undefined;

  constructor(private create: (...args: T) => Disposable) {
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start(...args: T) {
    this.stop();
    this.item = this.create(...args);
  }

  stop() {
    this.item?.dispose();
    this.item = undefined;
  }
}
