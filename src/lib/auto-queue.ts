import { Queue } from "./queue.js";

export class AutoQueue extends Queue {
  _pendingPromise: boolean;
  _stop: boolean;
  constructor() {
    super(),
      this._pendingPromise = false;
    this._stop = false;
  }

  enqueue(action: any) {
    return new Promise((resolve, reject) => {
      super.enqueue({ action, resolve, reject })
      this.dequeue()
    })
  }

  async dequeue() {
    if (this._pendingPromise) {
      return false
    }

    let item = super.dequeue();
    if (!item) {
      return false
    }

    try {
      this._pendingPromise = true

      let payload = await item.action(this);

      this._pendingPromise = false
      item.resolve(payload)
    } catch (e) {
      this._pendingPromise = false
      item.reject(e)
    } finally {
      this.dequeue()
    }
  }
}