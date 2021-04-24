import BNode from './Node';
import R from 'ramda';

export default class BLeaf {
  data: any[];
  keys: any[];
  parent: BNode | null;
  order: number;
  constructor(keys: any[], parent: BNode | null, data: any[], order: number) {
    this.data = data;
    this.keys = keys;
    this.parent = parent;
    this.order = order;
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
    const keys = this.keys.splice(0, midIndex);
    const data = this.data.splice(0, midIndex);
    if (!this.parent) {
      // new root node
      this.parent = new BNode([], [], null);
    }
    const newNode = new BLeaf(keys, this.parent, data, this.order);
    this.parent.insert(this);
    this.parent.insert(newNode);
    return newNode;
  }
  getIndex(key: any) {
    const index = this.keys.find(k => k < key);
    if (key !== -1) {
      return {index, node: this};
    }
    return {index: this.keys.length, node: this};
  }

  getId(key: any) {
    const index = this.keys.indexOf(key);
    if (index !== -1) {
      return this.data[index];
    }
    return null;
  }
}