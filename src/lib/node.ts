export class Node {
  value: any;
  next: any;
  previous: any;
  constructor(value: any) {
    this.value = value;
    this.next = null;
    this.previous = null;
  }
}