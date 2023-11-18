import { LinkedList } from "./linked-list"

export class Queue {
  items: LinkedList

  constructor() {
    this.items = new LinkedList()
  }

  get size() {
    return this.items.size
  }

  enqueue(item: any): this | Promise<unknown> {
    this.items.addLast(item)
    return this
  }

  dequeue() {
    return this.items.removeFirst();
  }

  isEmpty() {
    return !this.items.size
  }

  add(...args: [any]) {
    return this.enqueue(...args)
  }

  remove() {
    return this.dequeue();
  }
}