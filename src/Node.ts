import R from 'ramda';
import {Cursor, Dict} from './Interface';
export class BNode {
  keys: any[];
  parent: BNode | null;
  children: any[];
  order: number;
  constructor(keys: any[], children: any[], parent: BNode | null, order: number) {
    this.keys = keys;
    this.parent = parent;
    this.children = children;
    this.order = order;
  }

  insert(node: BNode | BLeaf) {
    const key = node instanceof BNode ? node.keys.shift() : node.keys[0];
    const i = R.findIndex((k) => k > key, this.keys);
    const index = i === -1 ? this.keys.length : i;
    if (this.children.length) {
      this.keys = R.insert(index, key, this.keys);
    }
    this.children = R.insert(index + 1, node, this.children);
    return this.split();
  }
  split(): BNode {
    if (this.keys.length < this.order) {
      return this;
    }
    const midIndex = Math.floor(this.keys.length / 2);
    const keys = this.keys.slice(midIndex);
    const children = this.children.slice(midIndex + 1);
    this.children = this.children.slice(0, midIndex + 1);
    this.keys = this.keys.slice(0, midIndex);
    if (!this.parent) {
      this.parent = new BNode([], [this], null, this.order);
    }
    const newNode = new BNode(keys, children, this.parent, this.order);
    newNode.children.map(nn => {
      nn.parent = newNode;
    })
    return this.parent.insert(newNode);
  }

  getNode(key: any) {
    const i = R.findIndex((k) => k > key, this.keys);
    const index = i === -1 ? this.children.length - 1 : i;
    const node = this.children[index];
    if (node instanceof BLeaf) {
      return node;
    }
    return node.getNode(key);
  }
}

export class BLeaf {
  data: any[];
  keys: any[];
  parent: BNode | null;
  order: number;
  next: BLeaf | null;
  previous: BLeaf | null;
  constructor(keys: any[], parent: BNode | null, data: any[], order: number) {
    this.data = data;
    this.keys = keys;
    this.parent = parent;
    this.order = order;
    this.next = null;
    this.previous = null;
  }
  insert(key: any, value: any) {
    const {index} = this.getIndex(key);
    this.keys = R.insert(index, key, this.keys);
    this.data = R.insert(index, value, this.data);
    return this.split()
  }
  split() {
    if (this.keys.length < this.order) {
      return this;
    }
    const midIndex = Math.floor(this.keys.length / 2);
    const keys = this.keys.slice(midIndex);
    const data = this.data.slice(midIndex);
    this.keys = this.keys.slice(0, midIndex);
    this.data = this.data.slice(0, midIndex);

    if (!this.parent) {
      // new root node
      this.parent = new BNode([], [this], null, this.order);
    }
    const newNode = new BLeaf(keys, this.parent, data, this.order);
    this.next = newNode;
    newNode.previous = this;
    return this.parent.insert(newNode);
  }
  getIndex(key: any) {
    if (!this.keys.length) {
      return {index: 0, node: this};
    }
    const index = R.findIndex((k) => k > key, this.keys);
    if (index !== -1) {
      return {index, node: this};
    }
    return {index: this.keys.length, node: this};
  }

  getNode() {
    return this;
  }

  getId(key: any) {
    const index = this.keys.indexOf(key);
    if (index !== -1) {
      return this.data[index];
    }
    return null;
  }

  getAll(key: any) {
    const res: any[] = [];
    this.keys.map((k: any, i: number) => {
      if (k === key) {
        res.push(this.data[i])
      }
    });
    return res;
  }

  range(key: any, op: string) {
    this.data.filter((v, i) => {
      const k = this.keys[i];
      if (op === '$gt') {
        return k > key;
      }
      if (op === '$gte') {
        return k >= key;
      }
      if (op === '$lt') {
        return k < key;
      }
      if (op === '$lte') {
        return k <= key;
      }
    });
  }


  find(key: any, op: string) {
    return new BCursor(this, key, op);
  }
}

export class BCursor implements Cursor {
  previous: Cursor | null;
  data: any[];
  index: number;
  current: BLeaf;
  key: any;
  op: string;
  head: BLeaf | null;
  tail: BLeaf | null;
  options: Dict;
  constructor(current: BLeaf, key: any, op: string, options: Dict = {}) {
    this.previous = null;
    this.data = [];
    this.index = 0;
    this.current = current;
    this.key = key;
    this.op = op;
    this.head = null;
    this.tail = null;
    this.options = options;
  }


  valid() {
    if (this.current.previous) {
      return this.current.next !== null
    }
    if (this.current.next) {
      return this.current.previous !== null
    }
  }

  next() {
    if (this.current.next) {
      this.current = this.current.next;
    } else {
      this.tail = this.current;
    }
    return 1;
  }

  prev() {
    if (this.current.previous) {
      this.current = this.current.previous;
    } else {
      this.head = this.current;
    }
    return -1;
  }

  step() {
    if (['$gt', '$gte'].includes(this.op)) {
      return this.next();
    }
    this.prev();
  }

  all(): any[] {
    // @todo
    if (this.tail || this.head) {
      return this.data;
    }
    const limit = this.options.limit || 1000;
    for (let i = 0; i <= this.current.data.length; i++) {
      if (this.data.length >= limit) {
        return this.data;
      }
      const k = this.current.keys[i];
      const v = this.current.data[i];
      const res = this.filter(k);
      if (res) {
        this.data.push(v);
      }
    }
    this.step();
    return this.all();
  }

  filter(k: any): boolean {
    if (this.op === '$gt') {
      return k > this.key;
    }
    if (this.op === '$gte') {
      return k >= this.key;
    }
    if (this.op === '$lt') {
      return k < this.key;
    }
    if (this.op === '$lte') {
      return k <= this.key;
    }
    return false;
  }

  rewind() {
    while (this.valid) {
      this.step();
    }
  }

  *generator() {
    if (this.current !== this.head) {
      yield* this.current.data;
    }
    const data = this.current.data.filter((v, i) => {
      const k = this.current.keys[i];
      return this.filter(k);
    });
    // @todo
    this.step();
    yield* data;
  }
}