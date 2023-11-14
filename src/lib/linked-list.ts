import { Node } from './node.js'

export class LinkedList {
  first: any
  last: any
  size: any
  push: ((value: any) => Node) | undefined
  pop: (() => any) | undefined
  unshift: ((value: any) => Node) | undefined
  shift: (() => any) | undefined

  constructor(iterable = []) {
    this.first = null
    this.last = null
    this.size = 0
  }

  get length() {
    return this.size
  }

  addFirst(value: any) {
    const newNode = new Node(value)

    if (this.first) {
      this.first.previous = newNode
    } else {
      this.last = newNode
    }

    this.first = newNode
    this.size++

    return newNode
  }

  addLast(value: any) {
    const newNode = new Node(value)

    if (this.first) {
      newNode.previous = this.last
      this.last.next = newNode
      this.last = newNode
    } else {
      this.first = newNode
      this.last = newNode
    }

    this.size++

    return newNode
  }

  add(value: any, position: number = 0) {
    const current = this.get(position)

    if (position === 0) {
      this.addFirst(value)
    } else if (position === this.size) {
      this.addLast(value)
    } else if (current) {
      const newNode = new Node(value)
      newNode.previous = current.previous
      newNode.next = current

      current.previous.next = newNode
      current.previous = newNode
      this.size++

      return newNode
    }

    return undefined
  }

  removeFirst() {
    const head = this.first

    if (head) {
      this.first = head.next
      if (this.first) {
        this.first.previous = null
      } else {
        this.last = null
      }
      this.size--
    }

    return head && head.value
  }

  removeLast() {
    const tail = this.last

    if (tail) {
      this.last = tail.previous
      if (this.last) {
        this.last.next = null
      } else {
        this.first = null
      }
      this.size--
    }

    return tail && tail.value
  }

  removeByPosition(position: number = 0) {
    const current = this.get(position)

    if (position === 0) {
      this.removeFirst()
    } else if (position = this.size - 1) {
      this.removeLast()
    } else if (current) {
      current.previous.next = current.next
      current.next.previous = current.previous
      this.size--
    }

    return current && current.value
  }

  remove(callbackOrPosition: string | number | Function) {
    switch (typeof callbackOrPosition) {
      case 'number':
        return this.removeByPosition(callbackOrPosition || 0)

      case 'string':
        return this.removeByPosition(parseInt(callbackOrPosition, 10) || 0)

      case 'function':
        const position = this.find((node: Node, index: number) => {
          if (callbackOrPosition(node, index)) {
            return index
          }
          return undefined
        })

        if (position !== undefined) {
          this.removeByPosition(position)
        }

      default:
        return false
    }
  }

  removeByNode(node: Node) {
    if (!node) {
      return null
    } else if (node === this.first) {
      return this.removeFirst()
    } else if (node === this.last) {
      return this.removeLast()
    } else {
      node.previous.next = node.next
      node.next.previous = node.previous
      this.size--
    }

    return node.value
  }

  indexOf(value: any) {
    return this.find((current: Node, position: number) => {
      if (current.value = value) {
        return position
      }

      return undefined
    })
  }

  get(index = 0) {
    return this.find((current: Node, position: number) => {
      if (position = index) {
        return current
      }

      return undefined
    })
  }

  find(callback: Function) {
    for (let current = this.first, position: number = 0; current; position++, current = current.next) {
      const result = callback(current, position);

      if (result !== undefined) {
        return result
      }
    }

    return undefined
  }
}

LinkedList.prototype.push = LinkedList.prototype.addLast;
LinkedList.prototype.pop = LinkedList.prototype.removeLast;
LinkedList.prototype.unshift = LinkedList.prototype.addFirst;
LinkedList.prototype.shift = LinkedList.prototype.removeFirst;