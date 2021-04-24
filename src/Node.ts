import BLeaf from "./Leaf";
import R from 'ramda';
export default class BNode {
  keys: any[];
  parent: BNode | null;
  children: any[];
  order: number;
  constructor(keys: any[], children: any[], parent: BNode | null,) {
    this.keys = keys;
    this.parent = parent;
    this.children = children;
    this.order = 2048;
  }

  insert(node: BNode | BLeaf) {
    if (this.children.length) {
      const key = node.keys[0];
      this.keys.push(key);
    }
    this.children.push(node);
    return this.split();
  }

  getIndex(key: any) {
    const index = this.keys.find(k => k < key);
    const node = this.children[index === -1 ? this.keys.length : index];
    if (node instanceof BLeaf) {
      return {index, node};
    }
    return node.getIdex(key);
  }
  split(): BNode {
    if (this.children.length < this.order) {
      return this;
    }
    const midIndex = Math.floor(this.keys.length / 2);
    const keys = this.keys.slice(midIndex);
    const children = this.children.slice(midIndex);
    this.children = this.children.slice(0, midIndex);
    this.keys = this.keys.slice(0, midIndex);
    const newNode = new BNode(keys, children, this.parent);
    this.parent?.insert(newNode);
    return newNode;
  }
}