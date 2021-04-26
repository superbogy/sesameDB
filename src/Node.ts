import BLeaf from "./Leaf";
import R from 'ramda';
export default class BNode {
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

  // getIndex(key: any) {
  //   const i = R.findIndex((k) => k > key, this.keys);
  //   const index = i === -1 ? this.children.length - 1 : i;
  //   const node = this.children[index];
  //   if (node instanceof BLeaf) {
  //     return node;
  //   }
  //   console.log('bnnnnnnnnode getIndex', key, node.getIndex(key));
  //   return node.getIdex(key);
  // }
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